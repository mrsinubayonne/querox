-- =====================================================
-- SECURITY FIX: Add search_path to remaining functions
-- =====================================================

-- 1. Fix calculate_reorder_suggestions
CREATE OR REPLACE FUNCTION public.calculate_reorder_suggestions(p_user_id uuid, p_outlet_id uuid)
RETURNS TABLE(item_id uuid, item_name text, current_stock numeric, min_stock integer, suggested_order_quantity integer, supplier_name text, unit_price numeric, total_cost numeric)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
  RETURN QUERY
  SELECT 
    ii.id,
    ii.name,
    ii.current_stock,
    ii.min_stock,
    GREATEST(ii.reorder_quantity, ii.min_stock - ii.current_stock::integer)::integer,
    ii.supplier,
    ii.unit_price,
    (GREATEST(ii.reorder_quantity, ii.min_stock - ii.current_stock::integer) * COALESCE(ii.unit_price, 0))::numeric
  FROM public.inventory_items ii
  WHERE ii.user_id = p_user_id
    AND ii.outlet_id = p_outlet_id
    AND ii.current_stock <= ii.min_stock
  ORDER BY (ii.min_stock - ii.current_stock::integer) DESC;
END;
$function$;

-- 2. Fix generate_purchase_order_number
CREATE OR REPLACE FUNCTION public.generate_purchase_order_number()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
DECLARE
  year TEXT;
  month TEXT;
  random_num TEXT;
BEGIN
  year := TO_CHAR(NOW(), 'YYYY');
  month := TO_CHAR(NOW(), 'MM');
  random_num := LPAD(FLOOR(RANDOM() * 10000)::TEXT, 4, '0');
  RETURN 'PO-' || year || month || '-' || random_num;
END;
$function$;

-- 3. Fix update_access_codes_timestamp
CREATE OR REPLACE FUNCTION public.update_access_codes_timestamp()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
  NEW.last_modified_at = now();
  RETURN NEW;
END;
$function$;