
-- Ajouter la colonne status à la table customers si elle n'existe pas
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'customers' AND column_name = 'status') THEN
        ALTER TABLE public.customers ADD COLUMN status text DEFAULT 'active';
    END IF;
END $$;

-- Activer RLS sur toutes les tables
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.menus ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.menu_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reservations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stock_movements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

-- Créer les politiques RLS pour customers
DROP POLICY IF EXISTS "Users can view own customers" ON public.customers;
CREATE POLICY "Users can view own customers" ON public.customers
    FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own customers" ON public.customers;
CREATE POLICY "Users can insert own customers" ON public.customers
    FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own customers" ON public.customers;
CREATE POLICY "Users can update own customers" ON public.customers
    FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own customers" ON public.customers;
CREATE POLICY "Users can delete own customers" ON public.customers
    FOR DELETE USING (auth.uid() = user_id);

-- Créer les politiques RLS pour inventory_items
DROP POLICY IF EXISTS "Users can view own inventory" ON public.inventory_items;
CREATE POLICY "Users can view own inventory" ON public.inventory_items
    FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own inventory" ON public.inventory_items;
CREATE POLICY "Users can insert own inventory" ON public.inventory_items
    FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own inventory" ON public.inventory_items;
CREATE POLICY "Users can update own inventory" ON public.inventory_items
    FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own inventory" ON public.inventory_items;
CREATE POLICY "Users can delete own inventory" ON public.inventory_items
    FOR DELETE USING (auth.uid() = user_id);

-- Créer les politiques RLS pour menus
DROP POLICY IF EXISTS "Users can view own menus" ON public.menus;
CREATE POLICY "Users can view own menus" ON public.menus
    FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own menus" ON public.menus;
CREATE POLICY "Users can insert own menus" ON public.menus
    FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own menus" ON public.menus;
CREATE POLICY "Users can update own menus" ON public.menus
    FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own menus" ON public.menus;
CREATE POLICY "Users can delete own menus" ON public.menus
    FOR DELETE USING (auth.uid() = user_id);

-- Créer les politiques RLS pour menu_categories
DROP POLICY IF EXISTS "Users can view menu categories" ON public.menu_categories;
CREATE POLICY "Users can view menu categories" ON public.menu_categories
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.menus 
            WHERE menus.id = menu_categories.menu_id 
            AND menus.user_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "Users can insert menu categories" ON public.menu_categories;
CREATE POLICY "Users can insert menu categories" ON public.menu_categories
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.menus 
            WHERE menus.id = menu_categories.menu_id 
            AND menus.user_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "Users can update menu categories" ON public.menu_categories;
CREATE POLICY "Users can update menu categories" ON public.menu_categories
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.menus 
            WHERE menus.id = menu_categories.menu_id 
            AND menus.user_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "Users can delete menu categories" ON public.menu_categories;
CREATE POLICY "Users can delete menu categories" ON public.menu_categories
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM public.menus 
            WHERE menus.id = menu_categories.menu_id 
            AND menus.user_id = auth.uid()
        )
    );

-- Créer les politiques RLS pour menu_items
DROP POLICY IF EXISTS "Users can view menu items" ON public.menu_items;
CREATE POLICY "Users can view menu items" ON public.menu_items
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.menu_categories mc
            JOIN public.menus m ON mc.menu_id = m.id
            WHERE mc.id = menu_items.category_id 
            AND m.user_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "Users can insert menu items" ON public.menu_items;
CREATE POLICY "Users can insert menu items" ON public.menu_items
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.menu_categories mc
            JOIN public.menus m ON mc.menu_id = m.id
            WHERE mc.id = menu_items.category_id 
            AND m.user_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "Users can update menu items" ON public.menu_items;
CREATE POLICY "Users can update menu items" ON public.menu_items
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.menu_categories mc
            JOIN public.menus m ON mc.menu_id = m.id
            WHERE mc.id = menu_items.category_id 
            AND m.user_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "Users can delete menu items" ON public.menu_items;
CREATE POLICY "Users can delete menu items" ON public.menu_items
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM public.menu_categories mc
            JOIN public.menus m ON mc.menu_id = m.id
            WHERE mc.id = menu_items.category_id 
            AND m.user_id = auth.uid()
        )
    );

-- Créer les politiques RLS pour reservations
DROP POLICY IF EXISTS "Users can view own reservations" ON public.reservations;
CREATE POLICY "Users can view own reservations" ON public.reservations
    FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own reservations" ON public.reservations;
CREATE POLICY "Users can insert own reservations" ON public.reservations
    FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own reservations" ON public.reservations;
CREATE POLICY "Users can update own reservations" ON public.reservations
    FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own reservations" ON public.reservations;
CREATE POLICY "Users can delete own reservations" ON public.reservations
    FOR DELETE USING (auth.uid() = user_id);

-- Créer les politiques RLS pour stock_movements
DROP POLICY IF EXISTS "Users can view stock movements" ON public.stock_movements;
CREATE POLICY "Users can view stock movements" ON public.stock_movements
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.inventory_items 
            WHERE inventory_items.id = stock_movements.item_id 
            AND inventory_items.user_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "Users can insert stock movements" ON public.stock_movements;
CREATE POLICY "Users can insert stock movements" ON public.stock_movements
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.inventory_items 
            WHERE inventory_items.id = stock_movements.item_id 
            AND inventory_items.user_id = auth.uid()
        )
    );

-- Créer les politiques RLS pour transactions
DROP POLICY IF EXISTS "Users can view own transactions" ON public.transactions;
CREATE POLICY "Users can view own transactions" ON public.transactions
    FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own transactions" ON public.transactions;
CREATE POLICY "Users can insert own transactions" ON public.transactions
    FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own transactions" ON public.transactions;
CREATE POLICY "Users can update own transactions" ON public.transactions
    FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own transactions" ON public.transactions;
CREATE POLICY "Users can delete own transactions" ON public.transactions
    FOR DELETE USING (auth.uid() = user_id);
