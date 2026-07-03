CREATE OR REPLACE FUNCTION public.add_order_to_table_session(
  _session_id uuid,
  _items jsonb,
  _total_amount numeric,
  _customer_name text DEFAULT NULL,
  _customer_phone text DEFAULT NULL,
  _customer_email text DEFAULT NULL,
  _notes text DEFAULT NULL
)
RETURNS TABLE(order_id uuid, session_id uuid, session_total numeric)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_session public.table_sessions%ROWTYPE;
  v_order public.orders%ROWTYPE;
  v_authorized boolean := false;
  v_items jsonb := COALESCE(_items, '[]'::jsonb);
  v_amount numeric := COALESCE(_total_amount, 0);
BEGIN
  SELECT * INTO v_session
  FROM public.table_sessions
  WHERE id = _session_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Session introuvable';
  END IF;

  IF v_session.status <> 'active' THEN
    RAISE EXCEPTION 'Cette table n''est plus ouverte';
  END IF;

  v_authorized := v_session.user_id = auth.uid();

  IF NOT v_authorized THEN
    v_authorized := public.team_member_can_access(
      v_session.user_id,
      v_session.outlet_id,
      ARRAY['manage_tables','manage_orders']
    );
  END IF;

  IF NOT v_authorized THEN
    RAISE EXCEPTION 'Non autorisé';
  END IF;

  INSERT INTO public.orders (
    user_id,
    outlet_id,
    session_id,
    table_number,
    order_type,
    customer_name,
    customer_phone,
    customer_email,
    items,
    total_amount,
    status,
    notes
  ) VALUES (
    v_session.user_id,
    v_session.outlet_id,
    v_session.id,
    v_session.table_number,
    'sur_place',
    COALESCE(NULLIF(_customer_name, ''), 'Table ' || v_session.table_number),
    NULLIF(_customer_phone, ''),
    NULLIF(_customer_email, ''),
    v_items,
    v_amount,
    'pending',
    NULLIF(_notes, '')
  ) RETURNING * INTO v_order;

  UPDATE public.table_sessions
  SET total_amount = (
        SELECT COALESCE(SUM(o.total_amount), 0)
        FROM public.orders o
        WHERE o.session_id = v_session.id
      ),
      updated_at = now()
  WHERE id = v_session.id
  RETURNING * INTO v_session;

  RETURN QUERY SELECT v_order.id, v_session.id, COALESCE(v_session.total_amount, 0);
END;
$$;

REVOKE ALL ON FUNCTION public.add_order_to_table_session(uuid, jsonb, numeric, text, text, text, text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.add_order_to_table_session(uuid, jsonb, numeric, text, text, text, text) TO authenticated;

DROP POLICY IF EXISTS "Team members can create orders for owner sessions" ON public.orders;
CREATE POLICY "Team members can create orders for owner sessions"
ON public.orders
FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() = user_id
  OR EXISTS (
    SELECT 1
    FROM public.table_sessions ts
    WHERE ts.id = orders.session_id
      AND ts.user_id = orders.user_id
      AND (orders.outlet_id IS NULL OR ts.outlet_id = orders.outlet_id)
      AND public.team_member_can_access(ts.user_id, ts.outlet_id, ARRAY['manage_tables','manage_orders'])
  )
);

DROP POLICY IF EXISTS "Team members can view owner orders" ON public.orders;
CREATE POLICY "Team members can view owner orders"
ON public.orders
FOR SELECT
TO authenticated
USING (
  auth.uid() = user_id
  OR EXISTS (
    SELECT 1
    FROM public.team_members tm
    WHERE tm.owner_id = orders.user_id
      AND (tm.member_user_id = auth.uid() OR tm.member_email = (auth.jwt() ->> 'email'))
      AND tm.is_active = true
      AND tm.status = 'accepted'
  )
);