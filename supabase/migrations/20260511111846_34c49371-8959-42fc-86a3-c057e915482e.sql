CREATE OR REPLACE FUNCTION public.is_active_team_member_for_owner(_owner_id uuid)
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
  );
$$;

CREATE OR REPLACE FUNCTION public.verify_team_invitation(_token text)
RETURNS TABLE(id uuid, full_name text, member_email text, role text, status text, owner_id uuid, outlet_id uuid)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public, extensions
AS $$
BEGIN
  RETURN QUERY
  SELECT tm.id, tm.full_name, tm.member_email, tm.role, tm.status, tm.owner_id, tm.outlet_id
  FROM public.team_members tm
  WHERE tm.is_active = true
    AND tm.status IN ('pending', 'accepted')
    AND (
      tm.access_code = upper(trim(_token))
      OR tm.access_code = trim(_token)
      OR (tm.access_code LIKE '$2%' AND tm.access_code = crypt(upper(trim(_token)), tm.access_code))
      OR (tm.access_code LIKE '$2%' AND tm.access_code = crypt(trim(_token), tm.access_code))
    );
END;
$$;

CREATE OR REPLACE FUNCTION public.complete_team_member_setup(_token text, _email text, _new_access_code text DEFAULT NULL)
RETURNS TABLE(member_id uuid, owner_id uuid, member_role text, outlet_id uuid, full_name text)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
DECLARE
  v_member RECORD;
  v_code text;
BEGIN
  v_code := NULLIF(upper(trim(_new_access_code)), '');

  SELECT tm.id, tm.owner_id, tm.role, tm.outlet_id, tm.full_name
  INTO v_member
  FROM public.team_members tm
  WHERE tm.is_active = true
    AND tm.status IN ('pending', 'accepted')
    AND (
      tm.access_code = upper(trim(_token))
      OR tm.access_code = trim(_token)
      OR (tm.access_code LIKE '$2%' AND tm.access_code = crypt(upper(trim(_token)), tm.access_code))
      OR (tm.access_code LIKE '$2%' AND tm.access_code = crypt(trim(_token), tm.access_code))
    )
  LIMIT 1;

  IF NOT FOUND THEN
    RETURN;
  END IF;

  UPDATE public.team_members
  SET member_email = lower(trim(_email)),
      access_code = CASE
        WHEN v_code IS NOT NULL THEN crypt(v_code, gen_salt('bf', 10))
        WHEN access_code LIKE '$2%' THEN access_code
        ELSE crypt(upper(trim(access_code)), gen_salt('bf', 10))
      END,
      status = 'accepted',
      accepted_at = COALESCE(accepted_at, now()),
      last_login_at = now(),
      needs_password_setup = false,
      is_active = true,
      member_user_id = COALESCE(auth.uid(), member_user_id)
  WHERE id = v_member.id;

  RETURN QUERY SELECT v_member.id, v_member.owner_id, v_member.role, v_member.outlet_id, v_member.full_name;
END;
$$;

CREATE OR REPLACE FUNCTION public.accept_team_invitation(_token text, _email text)
RETURNS TABLE(member_id uuid, owner_id uuid, member_role text, outlet_id uuid, full_name text)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
  SELECT * FROM public.complete_team_member_setup(_token, _email, NULL);
$$;

CREATE OR REPLACE FUNCTION public.team_member_login(_email text, _access_code text)
RETURNS TABLE(member_id uuid, owner_id uuid, member_role text, status text, outlet_id uuid)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
BEGIN
  RETURN QUERY
  UPDATE public.team_members tm
  SET last_login_at = now(),
      member_user_id = COALESCE(auth.uid(), tm.member_user_id)
  WHERE tm.member_email = lower(trim(_email))
    AND tm.is_active = true
    AND tm.status = 'accepted'
    AND (
      tm.access_code = upper(trim(_access_code))
      OR tm.access_code = trim(_access_code)
      OR (tm.access_code LIKE '$2%' AND tm.access_code = crypt(upper(trim(_access_code)), tm.access_code))
      OR (tm.access_code LIKE '$2%' AND tm.access_code = crypt(trim(_access_code), tm.access_code))
    )
  RETURNING tm.id, tm.owner_id, tm.role, tm.status, tm.outlet_id;
END;
$$;

DO $$
DECLARE
  t text;
BEGIN
  FOREACH t IN ARRAY ARRAY[
    'orders', 'invoices', 'inventory_items', 'stock_movements', 'business_periods',
    'transactions', 'table_sessions', 'reservations', 'customers', 'business_customers',
    'suppliers', 'invoice_settings', 'menus', 'outlets', 'debtor_payments',
    'purchase_orders', 'inventory_losses', 'events'
  ] LOOP
    IF to_regclass('public.' || t) IS NOT NULL THEN
      EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', 'Team members can view owner ' || t, t);
      EXECUTE format('CREATE POLICY %I ON public.%I FOR SELECT USING (public.is_active_team_member_for_owner(user_id))', 'Team members can view owner ' || t, t);
      EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', 'Team members can create owner ' || t, t);
      EXECUTE format('CREATE POLICY %I ON public.%I FOR INSERT WITH CHECK (public.is_active_team_member_for_owner(user_id))', 'Team members can create owner ' || t, t);
      EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', 'Team members can update owner ' || t, t);
      EXECUTE format('CREATE POLICY %I ON public.%I FOR UPDATE USING (public.is_active_team_member_for_owner(user_id)) WITH CHECK (public.is_active_team_member_for_owner(user_id))', 'Team members can update owner ' || t, t);
      EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', 'Team members can delete owner ' || t, t);
      EXECUTE format('CREATE POLICY %I ON public.%I FOR DELETE USING (public.is_active_team_member_for_owner(user_id))', 'Team members can delete owner ' || t, t);
    END IF;
  END LOOP;
END $$;

DROP POLICY IF EXISTS "Team members can manage owner menu categories" ON public.menu_categories;
CREATE POLICY "Team members can manage owner menu categories"
ON public.menu_categories
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.menus m
    WHERE m.id = menu_categories.menu_id
      AND public.is_active_team_member_for_owner(m.user_id)
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.menus m
    WHERE m.id = menu_categories.menu_id
      AND public.is_active_team_member_for_owner(m.user_id)
  )
);

DROP POLICY IF EXISTS "Team members can manage owner menu items" ON public.menu_items;
CREATE POLICY "Team members can manage owner menu items"
ON public.menu_items
FOR ALL
USING (
  EXISTS (
    SELECT 1
    FROM public.menu_categories mc
    JOIN public.menus m ON m.id = mc.menu_id
    WHERE mc.id = menu_items.category_id
      AND public.is_active_team_member_for_owner(m.user_id)
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM public.menu_categories mc
    JOIN public.menus m ON m.id = mc.menu_id
    WHERE mc.id = menu_items.category_id
      AND public.is_active_team_member_for_owner(m.user_id)
  )
);

DO $$
DECLARE
  t text;
BEGIN
  FOREACH t IN ARRAY ARRAY['menu_item_ingredients', 'menu_item_option_groups'] LOOP
    IF to_regclass('public.' || t) IS NOT NULL THEN
      EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', 'Team members can manage owner ' || t, t);
      EXECUTE format($fmt$
        CREATE POLICY %I
        ON public.%I
        FOR ALL
        USING (
          EXISTS (
            SELECT 1
            FROM public.menu_items mi
            JOIN public.menu_categories mc ON mc.id = mi.category_id
            JOIN public.menus m ON m.id = mc.menu_id
            WHERE mi.id = %I.menu_item_id
              AND public.is_active_team_member_for_owner(m.user_id)
          )
        )
        WITH CHECK (
          EXISTS (
            SELECT 1
            FROM public.menu_items mi
            JOIN public.menu_categories mc ON mc.id = mi.category_id
            JOIN public.menus m ON m.id = mc.menu_id
            WHERE mi.id = %I.menu_item_id
              AND public.is_active_team_member_for_owner(m.user_id)
          )
        )
      $fmt$, 'Team members can manage owner ' || t, t, t, t);
    END IF;
  END LOOP;
END $$;

DROP POLICY IF EXISTS "Team members can manage owner menu_item_option_values" ON public.menu_item_option_values;
CREATE POLICY "Team members can manage owner menu_item_option_values"
ON public.menu_item_option_values
FOR ALL
USING (
  EXISTS (
    SELECT 1
    FROM public.menu_item_option_groups og
    JOIN public.menu_items mi ON mi.id = og.menu_item_id
    JOIN public.menu_categories mc ON mc.id = mi.category_id
    JOIN public.menus m ON m.id = mc.menu_id
    WHERE og.id = menu_item_option_values.group_id
      AND public.is_active_team_member_for_owner(m.user_id)
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM public.menu_item_option_groups og
    JOIN public.menu_items mi ON mi.id = og.menu_item_id
    JOIN public.menu_categories mc ON mc.id = mi.category_id
    JOIN public.menus m ON m.id = mc.menu_id
    WHERE og.id = menu_item_option_values.group_id
      AND public.is_active_team_member_for_owner(m.user_id)
  )
);