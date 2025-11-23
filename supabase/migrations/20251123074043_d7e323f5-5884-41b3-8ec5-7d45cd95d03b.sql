-- First, drop the trigger that references a non-existent function
DROP TRIGGER IF EXISTS trigger_deduct_inventory_from_order ON public.orders;

-- Create the function to deduct inventory when an order is delivered/completed
CREATE OR REPLACE FUNCTION public.deduct_inventory_from_order()
RETURNS TRIGGER AS $$
DECLARE
  v_item RECORD;
  v_ingredient RECORD;
  v_current_stock NUMERIC;
BEGIN
  -- Only process if status changed to 'delivered' or 'completed'
  IF (TG_OP = 'UPDATE' AND OLD.status != NEW.status AND NEW.status IN ('delivered', 'completed')) 
     OR (TG_OP = 'INSERT' AND NEW.status IN ('delivered', 'completed')) THEN
    
    -- Loop through each item in the order
    FOR v_item IN 
      SELECT 
        jsonb_array_elements(NEW.items) as item
    LOOP
      -- Get the menu item id from the order item
      -- Loop through ingredients for this menu item
      FOR v_ingredient IN
        SELECT 
          mii.inventory_item_id,
          mii.quantity_needed,
          mii.unit,
          ii.current_stock,
          (v_item.item->>'quantity')::numeric as order_quantity
        FROM menu_item_ingredients mii
        JOIN inventory_items ii ON ii.id = mii.inventory_item_id
        WHERE mii.menu_item_id = (v_item.item->>'id')::uuid
          AND ii.user_id = NEW.user_id
      LOOP
        -- Calculate total quantity to deduct
        v_current_stock := v_ingredient.current_stock - (v_ingredient.quantity_needed * v_ingredient.order_quantity);
        
        -- Update inventory
        UPDATE inventory_items 
        SET 
          current_stock = GREATEST(0, v_current_stock),
          updated_at = now()
        WHERE id = v_ingredient.inventory_item_id;
        
        -- Create stock movement record
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
          'Vente - Commande #' || NEW.id,
          'sale',
          v_ingredient.current_stock,
          GREATEST(0, v_current_stock),
          NEW.user_id,
          'Déduction automatique pour commande'
        );
      END LOOP;
    END LOOP;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Now recreate the trigger
CREATE TRIGGER trigger_deduct_inventory_from_order
  AFTER INSERT OR UPDATE OF status ON public.orders
  FOR EACH ROW
  EXECUTE FUNCTION public.deduct_inventory_from_order();