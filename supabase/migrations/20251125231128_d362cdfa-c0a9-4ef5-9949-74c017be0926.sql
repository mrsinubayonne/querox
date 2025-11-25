-- Ajouter support pour plats à prix personnalisable dans menu_items
ALTER TABLE menu_items 
ADD COLUMN IF NOT EXISTS is_custom_price boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS is_custom_name boolean DEFAULT false;

-- Ajouter support pour noms personnalisés de tables
ALTER TABLE table_sessions
ADD COLUMN IF NOT EXISTS custom_table_name text;

-- Index pour optimiser les requêtes
CREATE INDEX IF NOT EXISTS idx_menu_items_custom_price ON menu_items(is_custom_price) WHERE is_custom_price = true;