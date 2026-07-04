
CREATE OR REPLACE FUNCTION public.deduct_inventory_from_invoice()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_item RECORD;
  v_ingredient RECORD;
  v_current_stock NUMERIC;
  v_menu_item_id UUID;
  v_raw_id TEXT;
BEGIN
  IF (TG_OP = 'UPDATE' AND OLD.status != 'paid' AND NEW.status = 'paid') THEN
    FOR v_item IN
      SELECT jsonb_array_elements(COALESCE(NEW.items, '[]'::jsonb)) as item
    LOOP
      v_menu_item_id := NULL;
      v_raw_id := COALESCE(v_item.item->>'menu_item_id', v_item.item->>'id');

      -- Only accept valid UUIDs; skip custom/offline ids like "custom-123"
      IF v_raw_id IS NOT NULL AND v_raw_id ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$' THEN
        BEGIN
          v_menu_item_id := v_raw_id::uuid;
        EXCEPTION WHEN OTHERS THEN
          v_menu_item_id := NULL;
        END;
      END IF;

      IF v_menu_item_id IS NULL THEN
        CONTINUE;
      END IF;

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
        v_current_stock := v_ingredient.current_stock - (v_ingredient.quantity_needed * v_ingredient.order_quantity);

        UPDATE inventory_items
        SET current_stock = GREATEST(0, v_current_stock),
            updated_at = now()
        WHERE id = v_ingredient.inventory_item_id;

        INSERT INTO stock_movements (
          item_id, quantity, movement_type, reason, reason_category,
          before_quantity, after_quantity, performed_by_user_id, notes
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
$function$;
