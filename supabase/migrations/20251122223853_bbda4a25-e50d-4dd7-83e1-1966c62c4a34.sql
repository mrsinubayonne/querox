-- Enrichir la table stock_movements avec plus de détails
ALTER TABLE stock_movements
ADD COLUMN IF NOT EXISTS before_quantity numeric DEFAULT 0,
ADD COLUMN IF NOT EXISTS after_quantity numeric DEFAULT 0,
ADD COLUMN IF NOT EXISTS reason_category text,
ADD COLUMN IF NOT EXISTS performed_by_user_id uuid REFERENCES auth.users(id),
ADD COLUMN IF NOT EXISTS notes text;

-- Ajouter des colonnes pour la gestion avancée à inventory_items
ALTER TABLE inventory_items
ADD COLUMN IF NOT EXISTS expiration_date date,
ADD COLUMN IF NOT EXISTS batch_number text,
ADD COLUMN IF NOT EXISTS reorder_point integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS reorder_quantity integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS last_reorder_date date;

-- Table pour les règles de réapprovisionnement
CREATE TABLE IF NOT EXISTS inventory_reorder_rules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  inventory_item_id uuid NOT NULL REFERENCES inventory_items(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id),
  min_quantity integer NOT NULL DEFAULT 0,
  target_quantity integer NOT NULL DEFAULT 0,
  lead_time_days integer NOT NULL DEFAULT 7,
  safety_stock integer NOT NULL DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Table pour les commandes fournisseurs
CREATE TABLE IF NOT EXISTS purchase_orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id),
  outlet_id uuid REFERENCES outlets(id),
  supplier_id uuid REFERENCES suppliers(id),
  order_number text NOT NULL,
  status text NOT NULL DEFAULT 'draft',
  order_date date NOT NULL DEFAULT CURRENT_DATE,
  expected_delivery_date date,
  actual_delivery_date date,
  items jsonb NOT NULL DEFAULT '[]',
  total_amount numeric DEFAULT 0,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Table pour les pertes et gaspillage
CREATE TABLE IF NOT EXISTS inventory_losses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  inventory_item_id uuid NOT NULL REFERENCES inventory_items(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id),
  outlet_id uuid REFERENCES outlets(id),
  quantity numeric NOT NULL,
  loss_type text NOT NULL,
  loss_category text NOT NULL,
  cost_value numeric,
  reason text,
  recorded_by_user_id uuid REFERENCES auth.users(id),
  loss_date date NOT NULL DEFAULT CURRENT_DATE,
  created_at timestamptz DEFAULT now()
);

-- Index pour performance
CREATE INDEX IF NOT EXISTS idx_stock_movements_item_id ON stock_movements(item_id);
CREATE INDEX IF NOT EXISTS idx_stock_movements_created_at ON stock_movements(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_reorder_rules_item_id ON inventory_reorder_rules(inventory_item_id);
CREATE INDEX IF NOT EXISTS idx_purchase_orders_user_id ON purchase_orders(user_id);
CREATE INDEX IF NOT EXISTS idx_purchase_orders_status ON purchase_orders(status);
CREATE INDEX IF NOT EXISTS idx_inventory_losses_item_id ON inventory_losses(inventory_item_id);
CREATE INDEX IF NOT EXISTS idx_inventory_losses_loss_date ON inventory_losses(loss_date DESC);

-- RLS Policies pour inventory_reorder_rules
ALTER TABLE inventory_reorder_rules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own reorder rules"
ON inventory_reorder_rules
FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- RLS Policies pour purchase_orders
ALTER TABLE purchase_orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own purchase orders"
ON purchase_orders
FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- RLS Policies pour inventory_losses
ALTER TABLE inventory_losses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own inventory losses"
ON inventory_losses
FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Trigger pour updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_reorder_rules_updated_at
BEFORE UPDATE ON inventory_reorder_rules
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_purchase_orders_updated_at
BEFORE UPDATE ON purchase_orders
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Fonction pour générer un numéro de commande unique
CREATE OR REPLACE FUNCTION generate_purchase_order_number()
RETURNS TEXT AS $$
DECLARE
  year TEXT;
  month TEXT;
  random_num TEXT;
BEGIN
  year := TO_CHAR(NOW(), 'YYYY');
  month := TO_CHAR(NOW(), 'MM');
  random_num := LPAD(FLOOR(RANDOM() * 10000)::TEXT, 4, '0');
  RETURN 'PO-' || year || month || '-' || random_num;
END;
$$ LANGUAGE plpgsql;

-- Fonction pour calculer les suggestions de réapprovisionnement
CREATE OR REPLACE FUNCTION calculate_reorder_suggestions(p_user_id uuid, p_outlet_id uuid)
RETURNS TABLE(
  item_id uuid,
  item_name text,
  current_stock numeric,
  min_stock integer,
  suggested_order_quantity integer,
  supplier_name text,
  unit_price numeric,
  total_cost numeric
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    ii.id,
    ii.name,
    ii.current_stock,
    ii.min_stock,
    GREATEST(ii.reorder_quantity, ii.min_stock - ii.current_stock::integer)::integer,
    ii.supplier,
    ii.unit_price,
    (GREATEST(ii.reorder_quantity, ii.min_stock - ii.current_stock::integer) * COALESCE(ii.unit_price, 0))::numeric
  FROM inventory_items ii
  WHERE ii.user_id = p_user_id
    AND ii.outlet_id = p_outlet_id
    AND ii.current_stock <= ii.min_stock
  ORDER BY (ii.min_stock - ii.current_stock::integer) DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;