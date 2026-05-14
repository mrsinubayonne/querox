CREATE TABLE IF NOT EXISTS public.session_creation_audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id uuid NOT NULL DEFAULT gen_random_uuid(),
  actor_user_id uuid,
  owner_id uuid,
  outlet_id uuid,
  team_member_id uuid,
  table_number text,
  action text NOT NULL DEFAULT 'create_table_session_with_order',
  stage text NOT NULL,
  success boolean NOT NULL DEFAULT false,
  error_code text,
  error_message text,
  details jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.session_creation_audit_logs ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_session_creation_audit_owner_created
  ON public.session_creation_audit_logs(owner_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_session_creation_audit_outlet_created
  ON public.session_creation_audit_logs(outlet_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_session_creation_audit_request
  ON public.session_creation_audit_logs(request_id);

DROP POLICY IF EXISTS "Owners can view session creation audit logs" ON public.session_creation_audit_logs;
CREATE POLICY "Owners can view session creation audit logs"
ON public.session_creation_audit_logs
FOR SELECT
TO authenticated
USING (auth.uid() = owner_id);

DROP POLICY IF EXISTS "Team members can view assigned session creation audit logs" ON public.session_creation_audit_logs;
CREATE POLICY "Team members can view assigned session creation audit logs"
ON public.session_creation_audit_logs
FOR SELECT
TO authenticated
USING (
  owner_id IS NOT NULL
  AND outlet_id IS NOT NULL
  AND public.team_member_has_outlet_access(owner_id, outlet_id)
);

DROP POLICY IF EXISTS "No client insert session creation audit logs" ON public.session_creation_audit_logs;
CREATE POLICY "No client insert session creation audit logs"
ON public.session_creation_audit_logs
FOR INSERT
TO authenticated
WITH CHECK (false);

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
  v_actor uuid := auth.uid();
  v_is_owner boolean := false;
  v_has_team_access boolean := false;
  v_items_count integer := 0;
BEGIN
  RAISE LOG '[session-create] stage=start actor=% owner=% outlet=% table=%', v_actor, _owner_id, _outlet_id, _table_number;

  IF v_actor IS NULL THEN
    RAISE LOG '[session-create] stage=auth_failed owner=% outlet=% table=% reason=no_auth_uid', _owner_id, _outlet_id, _table_number;
    RAISE EXCEPTION 'Non authentifié';
  END IF;

  v_table_number := NULLIF(trim(_table_number), '');
  IF _owner_id IS NULL OR _outlet_id IS NULL OR v_table_number IS NULL THEN
    RAISE LOG '[session-create] stage=validation_failed actor=% owner=% outlet=% table=% reason=missing_required', v_actor, _owner_id, _outlet_id, _table_number;
    RAISE EXCEPTION 'Point de vente ou table manquant';
  END IF;

  IF NOT public.is_valid_public_outlet_owner(_outlet_id, _owner_id) THEN
    RAISE LOG '[session-create] stage=outlet_invalid actor=% owner=% outlet=% table=%', v_actor, _owner_id, _outlet_id, v_table_number;
    RAISE EXCEPTION 'Point de vente invalide';
  END IF;

  v_is_owner := v_actor = _owner_id;
  v_has_team_access := public.team_member_can_access(_owner_id, _outlet_id, ARRAY['manage_tables','manage_orders']);

  RAISE LOG '[session-create] stage=permission_check actor=% owner=% outlet=% table=% is_owner=% team_access=%', v_actor, _owner_id, _outlet_id, v_table_number, v_is_owner, v_has_team_access;

  IF NOT v_is_owner AND NOT v_has_team_access THEN
    RAISE LOG '[session-create] stage=permission_denied actor=% owner=% outlet=% table=% required_permissions=%', v_actor, _owner_id, _outlet_id, v_table_number, ARRAY['manage_tables','manage_orders'];
    RAISE EXCEPTION 'Permission insuffisante';
  END IF;

  IF _items IS NULL OR jsonb_typeof(_items) <> 'array' OR jsonb_array_length(_items) = 0 THEN
    RAISE LOG '[session-create] stage=validation_failed actor=% owner=% outlet=% table=% reason=empty_order', v_actor, _owner_id, _outlet_id, v_table_number;
    RAISE EXCEPTION 'Commande vide';
  END IF;

  v_items_count := jsonb_array_length(_items);

  IF EXISTS (
    SELECT 1
    FROM public.table_sessions ts
    WHERE ts.user_id = _owner_id
      AND ts.outlet_id = _outlet_id
      AND ts.table_number = v_table_number
      AND ts.status IN ('active', 'closed')
  ) THEN
    RAISE LOG '[session-create] stage=duplicate_table actor=% owner=% outlet=% table=%', v_actor, _owner_id, _outlet_id, v_table_number;
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

  RAISE LOG '[session-create] stage=session_inserted actor=% owner=% outlet=% table=% session=%', v_actor, _owner_id, _outlet_id, v_table_number, v_session.id;

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

  RAISE LOG '[session-create] stage=order_inserted actor=% owner=% outlet=% table=% session=% items=% total=%', v_actor, _owner_id, _outlet_id, v_table_number, v_session.id, v_items_count, v_total;

  INSERT INTO public.session_creation_audit_logs (
    actor_user_id,
    owner_id,
    outlet_id,
    table_number,
    stage,
    success,
    details
  ) VALUES (
    v_actor,
    _owner_id,
    _outlet_id,
    v_table_number,
    'completed',
    true,
    jsonb_build_object(
      'session_id', v_session.id,
      'items_count', v_items_count,
      'total_amount', v_total,
      'is_owner', v_is_owner,
      'team_access', v_has_team_access
    )
  );

  RETURN v_session;
EXCEPTION WHEN OTHERS THEN
  RAISE LOG '[session-create] stage=failed actor=% owner=% outlet=% table=% sqlstate=% message=%', v_actor, _owner_id, _outlet_id, COALESCE(v_table_number, _table_number), SQLSTATE, SQLERRM;
  RAISE;
END;
$$;

REVOKE ALL ON FUNCTION public.create_table_session_with_order(uuid, uuid, text, integer, jsonb, numeric) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.create_table_session_with_order(uuid, uuid, text, integer, jsonb, numeric) FROM anon;
GRANT EXECUTE ON FUNCTION public.create_table_session_with_order(uuid, uuid, text, integer, jsonb, numeric) TO authenticated;