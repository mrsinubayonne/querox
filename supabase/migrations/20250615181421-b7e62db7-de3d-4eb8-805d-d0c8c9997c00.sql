
-- Enable Row Level Security on menu-related tables
ALTER TABLE public.menus ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.menu_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.menu_items ENABLE ROW LEVEL SECURITY;

-- Policies for 'menus' table
-- Allow anyone to view menus (for public pages)
CREATE POLICY "Public menus are viewable by everyone."
ON public.menus FOR SELECT
USING (true);

-- Allow logged-in users to manage their own menus
CREATE POLICY "Users can manage their own menus."
ON public.menus FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);


-- Policies for 'menu_categories' table
-- Allow anyone to view menu categories
CREATE POLICY "Public menu categories are viewable by everyone."
ON public.menu_categories FOR SELECT
USING (true);

-- Allow users to manage categories of their own menus
CREATE POLICY "Users can manage categories of their own menus."
ON public.menu_categories FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM menus
    WHERE menus.id = menu_categories.menu_id AND menus.user_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM menus
    WHERE menus.id = menu_categories.menu_id AND menus.user_id = auth.uid()
  )
);

-- Policies for 'menu_items' table
-- Allow anyone to view menu items
CREATE POLICY "Public menu items are viewable by everyone."
ON public.menu_items FOR SELECT
USING (true);

-- Allow users to manage items in their own menus
CREATE POLICY "Users can manage items in their own menus."
ON public.menu_items FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM menu_categories
    JOIN menus ON menus.id = menu_categories.menu_id
    WHERE menu_categories.id = menu_items.category_id AND menus.user_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM menu_categories
    JOIN menus ON menus.id = menu_categories.menu_id
    WHERE menu_categories.id = menu_items.category_id AND menus.user_id = auth.uid()
  )
);
