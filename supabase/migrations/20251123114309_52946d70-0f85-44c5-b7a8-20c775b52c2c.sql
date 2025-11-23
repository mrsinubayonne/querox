-- Supprimer tous les triggers liés à l'inventaire sur orders
DROP TRIGGER IF EXISTS trigger_deduct_inventory ON orders;
DROP TRIGGER IF EXISTS trigger_deduct_inventory_from_order ON orders;

-- Supprimer la fonction avec CASCADE pour supprimer toutes les dépendances
DROP FUNCTION IF EXISTS deduct_inventory_from_order() CASCADE;

-- Créer la nouvelle fonction pour déduire l'inventaire lors du paiement de facture
CREATE OR REPLACE FUNCTION deduct_inventory_from_invoice()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_item RECORD;
  v_ingredient RECORD;
  v_current_stock NUMERIC;
  v_menu_item_id UUID;
BEGIN
  -- Seulement si le statut passe à 'paid'
  IF (TG_OP = 'UPDATE' AND OLD.status != 'paid' AND NEW.status = 'paid') THEN
    
    -- Parcourir chaque item dans la facture
    FOR v_item IN 
      SELECT 
        jsonb_array_elements(NEW.items) as item
    LOOP
      -- Extraire l'ID du menu item
      v_menu_item_id := (v_item.item->>'id')::uuid;
      
      -- Si pas d'ID, essayer avec menu_item_id
      IF v_menu_item_id IS NULL THEN
        v_menu_item_id := (v_item.item->>'menu_item_id')::uuid;
      END IF;
      
      -- Si toujours pas d'ID, passer à l'item suivant
      IF v_menu_item_id IS NULL THEN
        CONTINUE;
      END IF;
      
      -- Parcourir les ingrédients pour cet item de menu
      FOR v_ingredient IN
        SELECT 
          mii.inventory_item_id,
          mii.quantity_needed,
          mii.unit,
          ii.current_stock,
          COALESCE((v_item.item->>'quantity')::numeric, 1) as order_quantity
        FROM menu_item_ingredients mii
        JOIN inventory_items ii ON ii.id = mii.inventory_item_id
        WHERE mii.menu_item_id = v_menu_item_id
          AND ii.user_id = NEW.user_id
      LOOP
        -- Calculer la nouvelle quantité
        v_current_stock := v_ingredient.current_stock - (v_ingredient.quantity_needed * v_ingredient.order_quantity);
        
        -- Mettre à jour l'inventaire
        UPDATE inventory_items 
        SET 
          current_stock = GREATEST(0, v_current_stock),
          updated_at = now()
        WHERE id = v_ingredient.inventory_item_id;
        
        -- Créer un enregistrement de mouvement de stock
        INSERT INTO stock_movements (
          item_id,
          quantity,
          movement_type,
          reason,
          reason_category,
          before_quantity,
          after_quantity,
          performed_by_user_id,
          notes
        ) VALUES (
          v_ingredient.inventory_item_id,
          v_ingredient.quantity_needed * v_ingredient.order_quantity,
          'out',
          'Vente - Facture #' || NEW.invoice_number,
          'sale',
          v_ingredient.current_stock,
          GREATEST(0, v_current_stock),
          NEW.user_id,
          'Déduction automatique lors du paiement de la facture'
        );
      END LOOP;
    END LOOP;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Créer le trigger sur les factures
CREATE TRIGGER trigger_deduct_inventory_from_invoice
AFTER UPDATE ON invoices
FOR EACH ROW
EXECUTE FUNCTION deduct_inventory_from_invoice();