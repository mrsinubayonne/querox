
-- First, let's drop the existing policies one by one
DROP POLICY IF EXISTS "Allow public read access to menu categories" ON public.menu_categories;
DROP POLICY IF EXISTS "Allow full access to own menu categories" ON public.menu_categories;
DROP POLICY IF EXISTS "Allow public read access to menu items" ON public.menu_items;
DROP POLICY IF EXISTS "Allow full access to own menu items" ON public.menu_items;
