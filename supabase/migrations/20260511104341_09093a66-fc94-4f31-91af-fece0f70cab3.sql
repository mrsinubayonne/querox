
-- Fix 1: Remove insecure plaintext defaults on user_access_codes
ALTER TABLE public.user_access_codes ALTER COLUMN accounting_code DROP DEFAULT;
ALTER TABLE public.user_access_codes ALTER COLUMN management_code DROP DEFAULT;

-- Fix 2: Add user_id to stock_movements for direct tenant-scoped RLS
ALTER TABLE public.stock_movements ADD COLUMN IF NOT EXISTS user_id uuid;

-- Backfill from inventory_items
UPDATE public.stock_movements sm
SET user_id = ii.user_id
FROM public.inventory_items ii
WHERE sm.item_id = ii.id AND sm.user_id IS NULL;

-- Fallback: use performed_by_user_id if still null
UPDATE public.stock_movements
SET user_id = performed_by_user_id
WHERE user_id IS NULL AND performed_by_user_id IS NOT NULL;

-- Delete orphaned rows that have no possible owner (cannot be scoped)
DELETE FROM public.stock_movements WHERE user_id IS NULL;

ALTER TABLE public.stock_movements ALTER COLUMN user_id SET NOT NULL;
CREATE INDEX IF NOT EXISTS idx_stock_movements_user_id ON public.stock_movements(user_id);

-- Trigger to auto-fill user_id at insert
CREATE OR REPLACE FUNCTION public.stock_movements_set_user_id()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.user_id IS NULL THEN
    SELECT ii.user_id INTO NEW.user_id FROM public.inventory_items ii WHERE ii.id = NEW.item_id;
  END IF;
  IF NEW.user_id IS NULL THEN
    NEW.user_id := auth.uid();
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_stock_movements_set_user_id ON public.stock_movements;
CREATE TRIGGER trg_stock_movements_set_user_id
BEFORE INSERT ON public.stock_movements
FOR EACH ROW EXECUTE FUNCTION public.stock_movements_set_user_id();

-- Tighten RLS: rely on user_id directly
DROP POLICY IF EXISTS "Authenticated users can view stock movements" ON public.stock_movements;
DROP POLICY IF EXISTS "Authenticated users can insert stock movements" ON public.stock_movements;

CREATE POLICY "Users view own stock movements"
ON public.stock_movements FOR SELECT
USING (user_id = auth.uid() OR public.is_admin());

CREATE POLICY "Users insert own stock movements"
ON public.stock_movements FOR INSERT
WITH CHECK (
  (user_id = auth.uid() OR public.is_admin())
  AND EXISTS (
    SELECT 1 FROM public.inventory_items ii
    WHERE ii.id = item_id AND (ii.user_id = auth.uid() OR public.is_admin())
  )
);
