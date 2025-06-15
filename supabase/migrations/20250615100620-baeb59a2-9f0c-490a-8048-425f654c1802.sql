
-- Activer la sécurité au niveau des lignes pour les catégories de menu
ALTER TABLE public.menu_categories ENABLE ROW LEVEL SECURITY;

-- Autoriser l'accès en lecture publique aux catégories de menu pour les visiteurs
CREATE POLICY "Allow public read access to menu categories"
ON public.menu_categories
FOR SELECT
TO anon
USING (true);

-- Autoriser les utilisateurs connectés à gérer leurs propres catégories de menu
CREATE POLICY "Allow full access to own menu categories"
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

-- Activer la sécurité au niveau des lignes pour les plats du menu
ALTER TABLE public.menu_items ENABLE ROW LEVEL SECURITY;

-- Autoriser l'accès en lecture publique aux plats du menu pour les visiteurs
CREATE POLICY "Allow public read access to menu items"
ON public.menu_items
FOR SELECT
TO anon
USING (true);

-- Autoriser les utilisateurs connectés à gérer leurs propres plats
CREATE POLICY "Allow full access to own menu items"
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
