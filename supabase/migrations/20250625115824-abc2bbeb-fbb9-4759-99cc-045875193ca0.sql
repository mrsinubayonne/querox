
-- Vérifier les politiques existantes sur les tables
SELECT schemaname, tablename, policyname, cmd, roles
FROM pg_policies 
WHERE tablename IN ('menus', 'menu_categories', 'menu_items');

-- Activer RLS sur les tables si ce n'est pas déjà fait
ALTER TABLE public.menus ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.menu_categories ENABLE ROW LEVEL SECURITY;  
ALTER TABLE public.menu_items ENABLE ROW LEVEL SECURITY;

-- Supprimer les anciennes politiques s'elles existent et les recréer
DROP POLICY IF EXISTS "Users can view their own menus" ON public.menus;
DROP POLICY IF EXISTS "Users can create their own menus" ON public.menus;
DROP POLICY IF EXISTS "Users can update their own menus" ON public.menus;
DROP POLICY IF EXISTS "Users can delete their own menus" ON public.menus;

-- Recréer les politiques pour les menus
CREATE POLICY "Users can view their own menus"
ON public.menus
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own menus"
ON public.menus
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own menus"
ON public.menus
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own menus"
ON public.menus
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- Supprimer et recréer les politiques pour les catégories de menu
DROP POLICY IF EXISTS "Allow full access to own menu categories" ON public.menu_categories;
DROP POLICY IF EXISTS "Authenticated users can manage their own menu categories" ON public.menu_categories;

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

-- Supprimer et recréer les politiques pour les plats du menu
DROP POLICY IF EXISTS "Allow full access to own menu items" ON public.menu_items;
DROP POLICY IF EXISTS "Authenticated users can manage their own menu items" ON public.menu_items;

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
