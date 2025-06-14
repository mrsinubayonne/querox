
-- Table pour les menus
CREATE TABLE public.menus (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Table pour les catégories de plats
CREATE TABLE public.menu_categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  menu_id UUID REFERENCES public.menus(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Table pour les plats
CREATE TABLE public.menu_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  category_id UUID REFERENCES public.menu_categories(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  image_url TEXT,
  is_available BOOLEAN DEFAULT true,
  order_index INTEGER DEFAULT 0,
  allergens TEXT[],
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Table pour les produits d'inventaire
CREATE TABLE public.inventory_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  current_stock INTEGER DEFAULT 0,
  min_stock INTEGER DEFAULT 0,
  unit TEXT NOT NULL DEFAULT 'pcs',
  supplier TEXT,
  unit_price DECIMAL(10,2),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Table pour les mouvements de stock
CREATE TABLE public.stock_movements (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  item_id UUID REFERENCES public.inventory_items(id) ON DELETE CASCADE NOT NULL,
  movement_type TEXT NOT NULL CHECK (movement_type IN ('in', 'out', 'adjustment')),
  quantity INTEGER NOT NULL,
  reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Table pour les réservations
CREATE TABLE public.reservations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  customer_name TEXT NOT NULL,
  customer_email TEXT,
  customer_phone TEXT,
  date DATE NOT NULL,
  time TIME NOT NULL,
  party_size INTEGER NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'cancelled', 'completed')),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Table pour les transactions comptables
CREATE TABLE public.transactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  title TEXT NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('income', 'expense')),
  category TEXT NOT NULL,
  date DATE NOT NULL,
  status TEXT DEFAULT 'completed' CHECK (status IN ('pending', 'completed', 'cancelled')),
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Table pour les clients
CREATE TABLE public.customers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  total_visits INTEGER DEFAULT 0,
  total_spent DECIMAL(10,2) DEFAULT 0,
  last_visit DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Activer RLS sur toutes les tables
ALTER TABLE public.menus ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.menu_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stock_movements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reservations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;

-- Politiques RLS pour les menus
CREATE POLICY "Users can view their own menus" ON public.menus FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own menus" ON public.menus FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own menus" ON public.menus FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own menus" ON public.menus FOR DELETE USING (auth.uid() = user_id);

-- Politiques RLS pour les catégories de menu
CREATE POLICY "Users can view their menu categories" ON public.menu_categories FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.menus WHERE menus.id = menu_categories.menu_id AND menus.user_id = auth.uid())
);
CREATE POLICY "Users can create menu categories" ON public.menu_categories FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.menus WHERE menus.id = menu_categories.menu_id AND menus.user_id = auth.uid())
);
CREATE POLICY "Users can update their menu categories" ON public.menu_categories FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.menus WHERE menus.id = menu_categories.menu_id AND menus.user_id = auth.uid())
);
CREATE POLICY "Users can delete their menu categories" ON public.menu_categories FOR DELETE USING (
  EXISTS (SELECT 1 FROM public.menus WHERE menus.id = menu_categories.menu_id AND menus.user_id = auth.uid())
);

-- Politiques RLS pour les plats
CREATE POLICY "Users can view their menu items" ON public.menu_items FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.menu_categories mc 
    JOIN public.menus m ON mc.menu_id = m.id 
    WHERE mc.id = menu_items.category_id AND m.user_id = auth.uid()
  )
);
CREATE POLICY "Users can create menu items" ON public.menu_items FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.menu_categories mc 
    JOIN public.menus m ON mc.menu_id = m.id 
    WHERE mc.id = menu_items.category_id AND m.user_id = auth.uid()
  )
);
CREATE POLICY "Users can update their menu items" ON public.menu_items FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM public.menu_categories mc 
    JOIN public.menus m ON mc.menu_id = m.id 
    WHERE mc.id = menu_items.category_id AND m.user_id = auth.uid()
  )
);
CREATE POLICY "Users can delete their menu items" ON public.menu_items FOR DELETE USING (
  EXISTS (
    SELECT 1 FROM public.menu_categories mc 
    JOIN public.menus m ON mc.menu_id = m.id 
    WHERE mc.id = menu_items.category_id AND m.user_id = auth.uid()
  )
);

-- Politiques RLS pour l'inventaire
CREATE POLICY "Users can view their inventory" ON public.inventory_items FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create inventory items" ON public.inventory_items FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their inventory" ON public.inventory_items FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their inventory" ON public.inventory_items FOR DELETE USING (auth.uid() = user_id);

-- Politiques RLS pour les mouvements de stock
CREATE POLICY "Users can view their stock movements" ON public.stock_movements FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.inventory_items WHERE inventory_items.id = stock_movements.item_id AND inventory_items.user_id = auth.uid())
);
CREATE POLICY "Users can create stock movements" ON public.stock_movements FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.inventory_items WHERE inventory_items.id = stock_movements.item_id AND inventory_items.user_id = auth.uid())
);

-- Politiques RLS pour les réservations
CREATE POLICY "Users can view their reservations" ON public.reservations FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create reservations" ON public.reservations FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their reservations" ON public.reservations FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their reservations" ON public.reservations FOR DELETE USING (auth.uid() = user_id);

-- Politiques RLS pour les transactions
CREATE POLICY "Users can view their transactions" ON public.transactions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create transactions" ON public.transactions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their transactions" ON public.transactions FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their transactions" ON public.transactions FOR DELETE USING (auth.uid() = user_id);

-- Politiques RLS pour les clients
CREATE POLICY "Users can view their customers" ON public.customers FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create customers" ON public.customers FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their customers" ON public.customers FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their customers" ON public.customers FOR DELETE USING (auth.uid() = user_id);

-- Fonction pour mettre à jour updated_at automatiquement
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers pour updated_at
CREATE TRIGGER update_menus_updated_at BEFORE UPDATE ON public.menus FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_menu_items_updated_at BEFORE UPDATE ON public.menu_items FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_inventory_items_updated_at BEFORE UPDATE ON public.inventory_items FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_reservations_updated_at BEFORE UPDATE ON public.reservations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_customers_updated_at BEFORE UPDATE ON public.customers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
