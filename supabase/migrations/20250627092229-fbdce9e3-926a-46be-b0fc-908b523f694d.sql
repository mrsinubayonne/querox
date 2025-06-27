
-- Drop existing policies that are causing conflicts
DROP POLICY IF EXISTS "Authenticated users can manage their own menu categories" ON public.menu_categories;
DROP POLICY IF EXISTS "Authenticated users can manage their own menu items" ON public.menu_items;

-- Recreate RLS policies for menu_categories
CREATE POLICY "Authenticated users can manage their own menu categories"
ON public.menu_categories
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.menus
    WHERE menus.id = menu_categories.menu_id AND menus.user_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM public.menus
    WHERE menus.id = menu_categories.menu_id AND menus.user_id = auth.uid()
  )
);

-- Recreate RLS policies for menu_items  
CREATE POLICY "Authenticated users can manage their own menu items"
ON public.menu_items
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.menu_categories
    INNER JOIN public.menus ON menu_categories.menu_id = menus.id
    WHERE menu_categories.id = menu_items.category_id AND menus.user_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM public.menu_categories
    INNER JOIN public.menus ON menu_categories.menu_id = menus.id
    WHERE menu_categories.id = menu_items.category_id AND menus.user_id = auth.uid()
  )
);
