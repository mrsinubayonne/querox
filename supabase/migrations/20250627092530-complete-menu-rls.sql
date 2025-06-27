
-- Enable RLS on all menu-related tables
ALTER TABLE public.menus ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.menu_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.menu_items ENABLE ROW LEVEL SECURITY;

-- Create RLS policy for menus table
CREATE POLICY "Users can manage their own menus"
ON public.menus
FOR ALL
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- Allow public read access to active menus for the public menu page
CREATE POLICY "Public can read active menus"
ON public.menus
FOR SELECT
TO anon, authenticated
USING (is_active = true);

-- Allow public read access to menu categories for active menus
CREATE POLICY "Public can read menu categories for active menus"
ON public.menu_categories
FOR SELECT
TO anon, authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.menus
    WHERE menus.id = menu_categories.menu_id AND menus.is_active = true
  )
);

-- Allow public read access to available menu items for active menus
CREATE POLICY "Public can read available menu items for active menus"
ON public.menu_items
FOR SELECT
TO anon, authenticated
USING (
  is_available = true AND
  EXISTS (
    SELECT 1
    FROM public.menu_categories
    INNER JOIN public.menus ON menu_categories.menu_id = menus.id
    WHERE menu_categories.id = menu_items.category_id 
    AND menus.is_active = true
  )
);
