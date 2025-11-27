-- Optimisation pour 1000+ utilisateurs: Ajouter des index critiques

-- Index sur les colonnes fréquemment filtrées dans orders
CREATE INDEX IF NOT EXISTS idx_orders_user_outlet_created 
ON orders(user_id, outlet_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_orders_status 
ON orders(status) WHERE status IN ('pending', 'in_progress');

-- Index sur les colonnes fréquemment filtrées dans invoices
CREATE INDEX IF NOT EXISTS idx_invoices_user_outlet_status 
ON invoices(user_id, outlet_id, status);

CREATE INDEX IF NOT EXISTS idx_invoices_due_date 
ON invoices(due_date) WHERE status = 'unpaid';

CREATE INDEX IF NOT EXISTS idx_invoices_session_id 
ON invoices(session_id) WHERE session_id IS NOT NULL;

-- Index sur table_sessions pour performance
CREATE INDEX IF NOT EXISTS idx_table_sessions_user_outlet_status 
ON table_sessions(user_id, outlet_id, status);

CREATE INDEX IF NOT EXISTS idx_table_sessions_status_active 
ON table_sessions(status) WHERE status = 'active';

-- Index sur inventory_items pour requêtes fréquentes
CREATE INDEX IF NOT EXISTS idx_inventory_user_outlet 
ON inventory_items(user_id, outlet_id);

CREATE INDEX IF NOT EXISTS idx_inventory_low_stock 
ON inventory_items(current_stock, min_stock) WHERE current_stock <= min_stock;

-- Index sur transactions pour comptabilité
CREATE INDEX IF NOT EXISTS idx_transactions_user_outlet_date 
ON transactions(user_id, outlet_id, date DESC);

CREATE INDEX IF NOT EXISTS idx_transactions_category_type 
ON transactions(category, type);

-- Index sur reservations
CREATE INDEX IF NOT EXISTS idx_reservations_user_outlet_date 
ON reservations(user_id, outlet_id, reservation_date);

-- Index sur menus et menu_items pour accès public rapide
CREATE INDEX IF NOT EXISTS idx_menus_active 
ON menus(is_active) WHERE is_active = true;

CREATE INDEX IF NOT EXISTS idx_menu_items_available 
ON menu_items(is_available) WHERE is_available = true;

CREATE INDEX IF NOT EXISTS idx_menu_categories_menu_order 
ON menu_categories(menu_id, order_index);

-- Index sur business_customers pour débiteurs
CREATE INDEX IF NOT EXISTS idx_business_customers_user_outlet_active 
ON business_customers(user_id, outlet_id, is_active);

-- Analyser les tables pour mettre à jour les statistiques
ANALYZE orders;
ANALYZE invoices;
ANALYZE table_sessions;
ANALYZE inventory_items;
ANALYZE transactions;
ANALYZE reservations;
ANALYZE menus;
ANALYZE menu_items;