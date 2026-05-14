CREATE OR REPLACE FUNCTION public.team_member_has_outlet_access(_owner_id uuid, _outlet_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  WITH current_identity AS (
    SELECT auth.uid() AS uid, lower(auth.jwt() ->> 'email') AS email
  )
  SELECT EXISTS (
    SELECT 1
    FROM public.team_members tm, current_identity ci
    WHERE tm.owner_id = _owner_id
      AND tm.is_active = true
      AND tm.status IN ('pending', 'accepted')
      AND _outlet_id IS NOT NULL
      AND (
        (tm.member_user_id IS NOT NULL AND tm.member_user_id = ci.uid)
        OR lower(tm.member_email) = ci.email
      )
      AND (
        EXISTS (
          SELECT 1
          FROM public.team_member_outlets tmo
          WHERE tmo.team_member_id = tm.id
            AND tmo.outlet_id = _outlet_id
        )
        OR (
          NOT EXISTS (
            SELECT 1
            FROM public.team_member_outlets tmo
            WHERE tmo.team_member_id = tm.id
          )
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
  WITH current_identity AS (
    SELECT auth.uid() AS uid, lower(auth.jwt() ->> 'email') AS email
  ),
  current_member AS (
    SELECT tm.id, tm.role
    FROM public.team_members tm, current_identity ci
    WHERE tm.owner_id = _owner_id
      AND tm.is_active = true
      AND tm.status IN ('pending', 'accepted')
      AND (
        (tm.member_user_id IS NOT NULL AND tm.member_user_id = ci.uid)
        OR lower(tm.member_email) = ci.email
      )
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
      AND NOT EXISTS (
        SELECT 1
        FROM public.team_member_permissions tmp
        WHERE tmp.team_member_id = cm.id
      )
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

CREATE OR REPLACE FUNCTION public.create_table_session_with_order(
  _owner_id uuid,
  _outlet_id uuid,
  _table_number text,
  _number_of_guests integer,
  _items jsonb,
  _total_amount numeric
)
RETURNS public.table_sessions
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_session public.table_sessions;
  v_table_number text;
  v_total numeric;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Non authentifié';
  END IF;

  v_table_number := NULLIF(trim(_table_number), '');
  IF _owner_id IS NULL OR _outlet_id IS NULL OR v_table_number IS NULL THEN
    RAISE EXCEPTION 'Point de vente ou table manquant';
  END IF;

  IF NOT public.is_valid_public_outlet_owner(_outlet_id, _owner_id) THEN
    RAISE EXCEPTION 'Point de vente invalide';
  END IF;

  IF auth.uid() <> _owner_id
     AND NOT public.team_member_can_access(_owner_id, _outlet_id, ARRAY['manage_tables','manage_orders']) THEN
    RAISE EXCEPTION 'Permission insuffisante';
  END IF;

  IF _items IS NULL OR jsonb_typeof(_items) <> 'array' OR jsonb_array_length(_items) = 0 THEN
    RAISE EXCEPTION 'Commande vide';
  END IF;

  IF EXISTS (
    SELECT 1
    FROM public.table_sessions ts
    WHERE ts.user_id = _owner_id
      AND ts.outlet_id = _outlet_id
      AND ts.table_number = v_table_number
      AND ts.status IN ('active', 'closed')
  ) THEN
    RAISE EXCEPTION 'Cette table est déjà ouverte';
  END IF;

  v_total := GREATEST(COALESCE(_total_amount, 0), 0);

  INSERT INTO public.table_sessions (
    user_id,
    outlet_id,
    table_number,
    number_of_guests,
    status,
    total_amount
  ) VALUES (
    _owner_id,
    _outlet_id,
    v_table_number,
    CASE WHEN _number_of_guests IS NULL OR _number_of_guests < 1 THEN 1 ELSE _number_of_guests END,
    'active',
    v_total
  )
  RETURNING * INTO v_session;

  INSERT INTO public.orders (
    user_id,
    outlet_id,
    session_id,
    table_number,
    order_type,
    customer_name,
    items,
    total_amount,
    status
  ) VALUES (
    _owner_id,
    _outlet_id,
    v_session.id,
    v_table_number,
    'sur_place',
    'Table ' || v_table_number,
    _items,
    v_total,
    'pending'
  );

  RETURN v_session;
END;
$$;

GRANT EXECUTE ON FUNCTION public.create_table_session_with_order(uuid, uuid, text, integer, jsonb, numeric) TO authenticated;