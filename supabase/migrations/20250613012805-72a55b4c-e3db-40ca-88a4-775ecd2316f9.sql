
-- Drop existing policies if they exist, then recreate them
-- This ensures we have a clean slate for all RLS policies

-- Drop and recreate customers policies
DROP POLICY IF EXISTS "Users can view their own customers" ON public.customers;
DROP POLICY IF EXISTS "Users can insert their own customers" ON public.customers;
DROP POLICY IF EXISTS "Users can update their own customers" ON public.customers;
DROP POLICY IF EXISTS "Users can delete their own customers" ON public.customers;

-- Drop and recreate inventory_items policies
DROP POLICY IF EXISTS "Users can view their own inventory" ON public.inventory_items;
DROP POLICY IF EXISTS "Users can insert their own inventory" ON public.inventory_items;
DROP POLICY IF EXISTS "Users can update their own inventory" ON public.inventory_items;
DROP POLICY IF EXISTS "Users can delete their own inventory" ON public.inventory_items;

-- Drop and recreate transactions policies
DROP POLICY IF EXISTS "Users can view their own transactions" ON public.transactions;
DROP POLICY IF EXISTS "Users can insert their own transactions" ON public.transactions;
DROP POLICY IF EXISTS "Users can update their own transactions" ON public.transactions;
DROP POLICY IF EXISTS "Users can delete their own transactions" ON public.transactions;

-- Drop and recreate menus policies
DROP POLICY IF EXISTS "Users can view their own menus" ON public.menus;
DROP POLICY IF EXISTS "Users can insert their own menus" ON public.menus;
DROP POLICY IF EXISTS "Users can update their own menus" ON public.menus;
DROP POLICY IF EXISTS "Users can delete their own menus" ON public.menus;

-- Drop and recreate menu_categories policies
DROP POLICY IF EXISTS "Users can view categories of their own menus" ON public.menu_categories;
DROP POLICY IF EXISTS "Users can insert categories for their own menus" ON public.menu_categories;
DROP POLICY IF EXISTS "Users can update categories of their own menus" ON public.menu_categories;
DROP POLICY IF EXISTS "Users can delete categories of their own menus" ON public.menu_categories;

-- Drop and recreate menu_items policies
DROP POLICY IF EXISTS "Users can view items of their own menu categories" ON public.menu_items;
DROP POLICY IF EXISTS "Users can insert items for their own menu categories" ON public.menu_items;
DROP POLICY IF EXISTS "Users can update items of their own menu categories" ON public.menu_items;
DROP POLICY IF EXISTS "Users can delete items of their own menu categories" ON public.menu_items;

-- Drop and recreate reservations policies
DROP POLICY IF EXISTS "Users can view their own reservations" ON public.reservations;
DROP POLICY IF EXISTS "Users can insert their own reservations" ON public.reservations;
DROP POLICY IF EXISTS "Users can update their own reservations" ON public.reservations;
DROP POLICY IF EXISTS "Users can delete their own reservations" ON public.reservations;

-- Enable RLS on all tables that need it (safe to run multiple times)
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.menus ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.menu_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reservations ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for customers table
CREATE POLICY "Users can view their own customers" ON public.customers
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own customers" ON public.customers
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own customers" ON public.customers
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own customers" ON public.customers
  FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for inventory_items table
CREATE POLICY "Users can view their own inventory" ON public.inventory_items
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own inventory" ON public.inventory_items
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own inventory" ON public.inventory_items
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own inventory" ON public.inventory_items
  FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for transactions table
CREATE POLICY "Users can view their own transactions" ON public.transactions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own transactions" ON public.transactions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own transactions" ON public.transactions
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own transactions" ON public.transactions
  FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for menus table
CREATE POLICY "Users can view their own menus" ON public.menus
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own menus" ON public.menus
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own menus" ON public.menus
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own menus" ON public.menus
  FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for menu_categories table
-- These need to check if the menu belongs to the user
CREATE POLICY "Users can view categories of their own menus" ON public.menu_categories
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.menus 
      WHERE menus.id = menu_categories.menu_id 
      AND menus.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert categories for their own menus" ON public.menu_categories
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.menus 
      WHERE menus.id = menu_categories.menu_id 
      AND menus.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update categories of their own menus" ON public.menu_categories
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.menus 
      WHERE menus.id = menu_categories.menu_id 
      AND menus.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete categories of their own menus" ON public.menu_categories
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.menus 
      WHERE menus.id = menu_categories.menu_id 
      AND menus.user_id = auth.uid()
    )
  );

-- Create RLS policies for menu_items table
-- These need to check if the category belongs to a menu that belongs to the user
CREATE POLICY "Users can view items of their own menu categories" ON public.menu_items
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.menu_categories 
      JOIN public.menus ON menus.id = menu_categories.menu_id
      WHERE menu_categories.id = menu_items.category_id 
      AND menus.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert items for their own menu categories" ON public.menu_items
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.menu_categories 
      JOIN public.menus ON menus.id = menu_categories.menu_id
      WHERE menu_categories.id = menu_items.category_id 
      AND menus.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update items of their own menu categories" ON public.menu_items
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.menu_categories 
      JOIN public.menus ON menus.id = menu_categories.menu_id
      WHERE menu_categories.id = menu_items.category_id 
      AND menus.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete items of their own menu categories" ON public.menu_items
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.menu_categories 
      JOIN public.menus ON menus.id = menu_categories.menu_id
      WHERE menu_categories.id = menu_items.category_id 
      AND menus.user_id = auth.uid()
    )
  );

-- Create RLS policies for reservations table
CREATE POLICY "Users can view their own reservations" ON public.reservations
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own reservations" ON public.reservations
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own reservations" ON public.reservations
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own reservations" ON public.reservations
  FOR DELETE USING (auth.uid() = user_id);
