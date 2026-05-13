-- Tables des groupes d'options pour les plats (ex: "Viande", "Suppléments")
CREATE TABLE public.menu_item_option_groups (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  menu_item_id uuid NOT NULL REFERENCES public.menu_items(id) ON DELETE CASCADE,
  name text NOT NULL,
  selection_type text NOT NULL DEFAULT 'single' CHECK (selection_type IN ('single','multiple')),
  is_required boolean NOT NULL DEFAULT false,
  order_index integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_menu_item_option_groups_item ON public.menu_item_option_groups(menu_item_id);

ALTER TABLE public.menu_item_option_groups ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Owners can manage option groups"
ON public.menu_item_option_groups
FOR ALL
USING (EXISTS (
  SELECT 1 FROM menu_items mi
  JOIN menu_categories mc ON mc.id = mi.category_id
  JOIN menus m ON m.id = mc.menu_id
  WHERE mi.id = menu_item_option_groups.menu_item_id AND m.user_id = auth.uid()
))
WITH CHECK (EXISTS (
  SELECT 1 FROM menu_items mi
  JOIN menu_categories mc ON mc.id = mi.category_id
  JOIN menus m ON m.id = mc.menu_id
  WHERE mi.id = menu_item_option_groups.menu_item_id AND m.user_id = auth.uid()
));

CREATE POLICY "Public can view option groups of active menus"
ON public.menu_item_option_groups
FOR SELECT
TO anon, authenticated
USING (EXISTS (
  SELECT 1 FROM menu_items mi
  JOIN menu_categories mc ON mc.id = mi.category_id
  WHERE mi.id = menu_item_option_groups.menu_item_id
    AND mi.is_available = true
    AND is_menu_publicly_active(mc.menu_id)
));

-- Options individuelles (ex: "Bœuf", "Poulet")
CREATE TABLE public.menu_item_option_values (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id uuid NOT NULL REFERENCES public.menu_item_option_groups(id) ON DELETE CASCADE,
  name text NOT NULL,
  extra_price numeric NOT NULL DEFAULT 0,
  is_available boolean NOT NULL DEFAULT true,
  order_index integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_menu_item_option_values_group ON public.menu_item_option_values(group_id);

ALTER TABLE public.menu_item_option_values ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Owners can manage option values"
ON public.menu_item_option_values
FOR ALL
USING (EXISTS (
  SELECT 1 FROM menu_item_option_groups g
  JOIN menu_items mi ON mi.id = g.menu_item_id
  JOIN menu_categories mc ON mc.id = mi.category_id
  JOIN menus m ON m.id = mc.menu_id
  WHERE g.id = menu_item_option_values.group_id AND m.user_id = auth.uid()
))
WITH CHECK (EXISTS (
  SELECT 1 FROM menu_item_option_groups g
  JOIN menu_items mi ON mi.id = g.menu_item_id
  JOIN menu_categories mc ON mc.id = mi.category_id
  JOIN menus m ON m.id = mc.menu_id
  WHERE g.id = menu_item_option_values.group_id AND m.user_id = auth.uid()
));

CREATE POLICY "Public can view option values of active menus"
ON public.menu_item_option_values
FOR SELECT
TO anon, authenticated
USING (EXISTS (
  SELECT 1 FROM menu_item_option_groups g
  JOIN menu_items mi ON mi.id = g.menu_item_id
  JOIN menu_categories mc ON mc.id = mi.category_id
  WHERE g.id = menu_item_option_values.group_id
    AND mi.is_available = true
    AND is_menu_publicly_active(mc.menu_id)
));

CREATE TRIGGER update_menu_item_option_groups_updated_at
BEFORE UPDATE ON public.menu_item_option_groups
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();