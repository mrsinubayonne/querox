-- Team member outlet + permission helpers
CREATE OR REPLACE FUNCTION public.team_member_has_outlet_access(_owner_id uuid, _outlet_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.team_members tm
    WHERE tm.owner_id = _owner_id
      AND tm.member_user_id = auth.uid()
      AND tm.is_active = true
      AND tm.status = 'accepted'
      AND _outlet_id IS NOT NULL
      AND (
        EXISTS (
          SELECT 1 FROM public.team_member_outlets tmo
          WHERE tmo.team_member_id = tm.id AND tmo.outlet_id = _outlet_id
        )
        OR (
          NOT EXISTS (SELECT 1 FROM public.team_member_outlets tmo WHERE tmo.team_member_id = tm.id)
          AND tm.outlet_id = _outlet_id
        )
      )
  );
$$;

CREATE OR REPLACE FUNCTION public.team_member_has_any_permission(_owner_id uuid, _permission_names text[])
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  WITH current_member AS (
    SELECT tm.id, tm.role
    FROM public.team_members tm
    WHERE tm.owner_id = _owner_id
      AND tm.member_user_id = auth.uid()
      AND tm.is_active = true
      AND tm.status = 'accepted'
    LIMIT 1
  )
  SELECT EXISTS (
    SELECT 1
    FROM current_member cm
    JOIN public.team_member_permissions tmp ON tmp.team_member_id = cm.id
    JOIN public.permissions p ON p.id = tmp.permission_id
    WHERE p.name = ANY(_permission_names)
  )
  OR EXISTS (
    SELECT 1
    FROM current_member cm
    JOIN public.role_permissions rp ON rp.role_name = cm.role
    JOIN public.permissions p ON p.id = rp.permission_id
    WHERE p.name = ANY(_permission_names)
      AND NOT EXISTS (SELECT 1 FROM public.team_member_permissions tmp WHERE tmp.team_member_id = cm.id)
  );
$$;

CREATE OR REPLACE FUNCTION public.team_member_can_access(_owner_id uuid, _outlet_id uuid, _permission_names text[])
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT public.team_member_has_outlet_access(_owner_id, _outlet_id)
     AND public.team_member_has_any_permission(_owner_id, _permission_names);
$$;

-- Replace broad team-member policies with outlet + permission scoped policies
DROP POLICY IF EXISTS "Team members can view owner outlets" ON public.outlets;
DROP POLICY IF EXISTS "Team members can view owner's outlets" ON public.outlets;
DROP POLICY IF EXISTS "Team members can insert outlets for owner" ON public.outlets;
DROP POLICY IF EXISTS "Team members can create owner outlets" ON public.outlets;
DROP POLICY IF EXISTS "Team members can update owner outlets" ON public.outlets;
DROP POLICY IF EXISTS "Team members can delete owner outlets" ON public.outlets;
CREATE POLICY "Team members can view assigned outlets"
ON public.outlets FOR SELECT
USING (public.team_member_has_outlet_access(user_id, id));

DROP POLICY IF EXISTS "Team members can view owner orders" ON public.orders;
DROP POLICY IF EXISTS "Team members can create owner orders" ON public.orders;
DROP POLICY IF EXISTS "Team members can update owner orders" ON public.orders;
DROP POLICY IF EXISTS "Team members can delete owner orders" ON public.orders;
CREATE POLICY "Team members can view assigned outlet orders"
ON public.orders FOR SELECT
USING (public.team_member_can_access(user_id, outlet_id, ARRAY['view_orders','manage_orders']));
CREATE POLICY "Team members can create assigned outlet orders"
ON public.orders FOR INSERT
WITH CHECK (public.team_member_can_access(user_id, outlet_id, ARRAY['manage_orders']));
CREATE POLICY "Team members can update assigned outlet orders"
ON public.orders FOR UPDATE
USING (public.team_member_can_access(user_id, outlet_id, ARRAY['manage_orders']))
WITH CHECK (public.team_member_can_access(user_id, outlet_id, ARRAY['manage_orders']));
CREATE POLICY "Team members can delete assigned outlet orders"
ON public.orders FOR DELETE
USING (public.team_member_can_access(user_id, outlet_id, ARRAY['manage_orders']));

DROP POLICY IF EXISTS "Users and team members can manage table sessions" ON public.table_sessions;
DROP POLICY IF EXISTS "Team members can view owner table_sessions" ON public.table_sessions;
DROP POLICY IF EXISTS "Team members can create owner table_sessions" ON public.table_sessions;
DROP POLICY IF EXISTS "Team members can update owner table_sessions" ON public.table_sessions;
DROP POLICY IF EXISTS "Team members can delete owner table_sessions" ON public.table_sessions;
CREATE POLICY "Team members can view assigned outlet table sessions"
ON public.table_sessions FOR SELECT
USING (public.team_member_can_access(user_id, outlet_id, ARRAY['view_tables','manage_tables','view_orders','manage_orders']));
CREATE POLICY "Team members can create assigned outlet table sessions"
ON public.table_sessions FOR INSERT
WITH CHECK (public.team_member_can_access(user_id, outlet_id, ARRAY['manage_tables','manage_orders']));
CREATE POLICY "Team members can update assigned outlet table sessions"
ON public.table_sessions FOR UPDATE
USING (public.team_member_can_access(user_id, outlet_id, ARRAY['manage_tables','manage_orders']))
WITH CHECK (public.team_member_can_access(user_id, outlet_id, ARRAY['manage_tables','manage_orders']));
CREATE POLICY "Team members can delete assigned outlet table sessions"
ON public.table_sessions FOR DELETE
USING (public.team_member_can_access(user_id, outlet_id, ARRAY['manage_tables','manage_orders']));

DROP POLICY IF EXISTS "Team members can view owner invoices" ON public.invoices;
DROP POLICY IF EXISTS "Team members can create owner invoices" ON public.invoices;
DROP POLICY IF EXISTS "Team members can update owner invoices" ON public.invoices;
DROP POLICY IF EXISTS "Team members can delete owner invoices" ON public.invoices;
CREATE POLICY "Team members can view assigned outlet invoices"
ON public.invoices FOR SELECT
USING (public.team_member_can_access(user_id, outlet_id, ARRAY['view_invoices','manage_invoices']));
CREATE POLICY "Team members can create assigned outlet invoices"
ON public.invoices FOR INSERT
WITH CHECK (public.team_member_can_access(user_id, outlet_id, ARRAY['manage_invoices']));
CREATE POLICY "Team members can update assigned outlet invoices"
ON public.invoices FOR UPDATE
USING (public.team_member_can_access(user_id, outlet_id, ARRAY['manage_invoices']))
WITH CHECK (public.team_member_can_access(user_id, outlet_id, ARRAY['manage_invoices']));
CREATE POLICY "Team members can delete assigned outlet invoices"
ON public.invoices FOR DELETE
USING (public.team_member_can_access(user_id, outlet_id, ARRAY['manage_invoices']));

DROP POLICY IF EXISTS "Team members can view owner inventory_items" ON public.inventory_items;
DROP POLICY IF EXISTS "Team members can create owner inventory_items" ON public.inventory_items;
DROP POLICY IF EXISTS "Team members can update owner inventory_items" ON public.inventory_items;
DROP POLICY IF EXISTS "Team members can delete owner inventory_items" ON public.inventory_items;
CREATE POLICY "Team members can view assigned outlet inventory"
ON public.inventory_items FOR SELECT
USING (public.team_member_can_access(user_id, outlet_id, ARRAY['view_inventory','manage_inventory']));
CREATE POLICY "Team members can create assigned outlet inventory"
ON public.inventory_items FOR INSERT
WITH CHECK (public.team_member_can_access(user_id, outlet_id, ARRAY['manage_inventory']));
CREATE POLICY "Team members can update assigned outlet inventory"
ON public.inventory_items FOR UPDATE
USING (public.team_member_can_access(user_id, outlet_id, ARRAY['manage_inventory']))
WITH CHECK (public.team_member_can_access(user_id, outlet_id, ARRAY['manage_inventory']));
CREATE POLICY "Team members can delete assigned outlet inventory"
ON public.inventory_items FOR DELETE
USING (public.team_member_can_access(user_id, outlet_id, ARRAY['manage_inventory']));

DROP POLICY IF EXISTS "Team members can view owner menus" ON public.menus;
DROP POLICY IF EXISTS "Team members can create owner menus" ON public.menus;
DROP POLICY IF EXISTS "Team members can update owner menus" ON public.menus;
DROP POLICY IF EXISTS "Team members can delete owner menus" ON public.menus;
CREATE POLICY "Team members can view assigned outlet menus"
ON public.menus FOR SELECT
USING (public.team_member_can_access(user_id, outlet_id, ARRAY['view_menu','manage_menu']));
CREATE POLICY "Team members can create assigned outlet menus"
ON public.menus FOR INSERT
WITH CHECK (public.team_member_can_access(user_id, outlet_id, ARRAY['manage_menu']));
CREATE POLICY "Team members can update assigned outlet menus"
ON public.menus FOR UPDATE
USING (public.team_member_can_access(user_id, outlet_id, ARRAY['manage_menu']))
WITH CHECK (public.team_member_can_access(user_id, outlet_id, ARRAY['manage_menu']));
CREATE POLICY "Team members can delete assigned outlet menus"
ON public.menus FOR DELETE
USING (public.team_member_can_access(user_id, outlet_id, ARRAY['manage_menu']));

DROP POLICY IF EXISTS "Team members can manage owner menu categories" ON public.menu_categories;
CREATE POLICY "Team members can manage assigned outlet menu categories"
ON public.menu_categories FOR ALL
USING (EXISTS (SELECT 1 FROM public.menus m WHERE m.id = menu_categories.menu_id AND public.team_member_can_access(m.user_id, m.outlet_id, ARRAY['view_menu','manage_menu'])))
WITH CHECK (EXISTS (SELECT 1 FROM public.menus m WHERE m.id = menu_categories.menu_id AND public.team_member_can_access(m.user_id, m.outlet_id, ARRAY['manage_menu'])));

DROP POLICY IF EXISTS "Team members can manage owner menu items" ON public.menu_items;
CREATE POLICY "Team members can manage assigned outlet menu items"
ON public.menu_items FOR ALL
USING (EXISTS (SELECT 1 FROM public.menu_categories mc JOIN public.menus m ON m.id = mc.menu_id WHERE mc.id = menu_items.category_id AND public.team_member_can_access(m.user_id, m.outlet_id, ARRAY['view_menu','manage_menu'])))
WITH CHECK (EXISTS (SELECT 1 FROM public.menu_categories mc JOIN public.menus m ON m.id = mc.menu_id WHERE mc.id = menu_items.category_id AND public.team_member_can_access(m.user_id, m.outlet_id, ARRAY['manage_menu'])));

DROP POLICY IF EXISTS "Team members can view owner transactions" ON public.transactions;
DROP POLICY IF EXISTS "Team members can create owner transactions" ON public.transactions;
DROP POLICY IF EXISTS "Team members can update owner transactions" ON public.transactions;
DROP POLICY IF EXISTS "Team members can delete owner transactions" ON public.transactions;
CREATE POLICY "Team members can view assigned outlet transactions"
ON public.transactions FOR SELECT
USING (public.team_member_can_access(user_id, outlet_id, ARRAY['view_accounting','manage_accounting']));
CREATE POLICY "Team members can create assigned outlet transactions"
ON public.transactions FOR INSERT
WITH CHECK (public.team_member_can_access(user_id, outlet_id, ARRAY['manage_accounting']));
CREATE POLICY "Team members can update assigned outlet transactions"
ON public.transactions FOR UPDATE
USING (public.team_member_can_access(user_id, outlet_id, ARRAY['manage_accounting']))
WITH CHECK (public.team_member_can_access(user_id, outlet_id, ARRAY['manage_accounting']));
CREATE POLICY "Team members can delete assigned outlet transactions"
ON public.transactions FOR DELETE
USING (public.team_member_can_access(user_id, outlet_id, ARRAY['manage_accounting']));

-- Restore recoverable MIDOTEL menu content into the current Midotel menu without duplicating existing item names in the same category
DO $$
DECLARE
  source_menu uuid := '016faf90-b0d9-47cc-8cfe-23ac96915ba0';
  target_menu uuid := 'addc4ac9-c413-4689-bb0a-7d0f14c49f17';
  cat record;
  new_category_id uuid;
BEGIN
  FOR cat IN
    SELECT mc.*
    FROM public.menu_categories mc
    WHERE mc.menu_id = source_menu
      AND EXISTS (SELECT 1 FROM public.menu_items mi WHERE mi.category_id = mc.id)
  LOOP
    INSERT INTO public.menu_categories (menu_id, name, description, order_index)
    VALUES (target_menu, cat.name, cat.description, cat.order_index)
    RETURNING id INTO new_category_id;

    INSERT INTO public.menu_items (category_id, name, description, price, image_url, is_available, order_index, allergens, is_custom_price, is_custom_name)
    SELECT new_category_id, mi.name, mi.description, mi.price, mi.image_url, mi.is_available, mi.order_index, mi.allergens, mi.is_custom_price, mi.is_custom_name
    FROM public.menu_items mi
    WHERE mi.category_id = cat.id
      AND NOT EXISTS (
        SELECT 1
        FROM public.menu_categories tmc
        JOIN public.menu_items tmi ON tmi.category_id = tmc.id
        WHERE tmc.menu_id = target_menu
          AND lower(tmc.name) = lower(cat.name)
          AND lower(tmi.name) = lower(mi.name)
      );
  END LOOP;
END $$;