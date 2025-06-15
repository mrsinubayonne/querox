
-- Drop old permissive policies to avoid conflicts
DROP POLICY IF EXISTS "Public menus are viewable by everyone." ON public.menus;
DROP POLICY IF EXISTS "Users can manage their own menus." ON public.menus;
DROP POLICY IF EXISTS "Public menu categories are viewable by everyone." ON public.menu_categories;
DROP POLICY IF EXISTS "Users can manage categories of their own menus." ON public.menu_categories;
DROP POLICY IF EXISTS "Public menu items are viewable by everyone." ON public.menu_items;
DROP POLICY IF EXISTS "Users can manage items in their own menus." ON public.menu_items;

-- New policies for 'menus' table
-- Public can view active menus
CREATE POLICY "Public can view active menus" ON public.menus FOR SELECT USING (is_active = true);
-- Owners can manage their own menus
CREATE POLICY "Owners can manage their own menus" ON public.menus FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- New policies for 'menu_categories' table
-- Public can view categories of active menus
CREATE POLICY "Public can view categories of active menus" ON public.menu_categories FOR SELECT USING (EXISTS (SELECT 1 FROM menus WHERE menus.id = menu_categories.menu_id AND menus.is_active = true));
-- Owners can manage categories of their own menus
CREATE POLICY "Owners can manage categories of own menus" ON public.menu_categories FOR ALL USING (EXISTS (SELECT 1 FROM menus WHERE menus.id = menu_categories.menu_id AND menus.user_id = auth.uid())) WITH CHECK (EXISTS (SELECT 1 FROM menus WHERE menus.id = menu_categories.menu_id AND menus.user_id = auth.uid()));

-- New policies for 'menu_items' table
-- Public can view available items of active menus
CREATE POLICY "Public can view available items of active menus" ON public.menu_items FOR SELECT USING (is_available = true AND EXISTS (SELECT 1 FROM menu_categories JOIN menus ON menus.id = menu_categories.menu_id WHERE menu_categories.id = menu_items.category_id AND menus.is_active = true));
-- Owners can manage items in their own menus
CREATE POLICY "Owners can manage items in own menus" ON public.menu_items FOR ALL USING (EXISTS (SELECT 1 FROM menu_categories JOIN menus ON menus.id = menu_categories.menu_id WHERE menu_categories.id = menu_items.category_id AND menus.user_id = auth.uid())) WITH CHECK (EXISTS (SELECT 1 FROM menu_categories JOIN menus ON menus.id = menu_categories.menu_id WHERE menu_categories.id = menu_items.category_id AND menus.user_id = auth.uid()));
