-- Fix public QR menu order/session validation when outlets is protected by RLS.
-- RLS subqueries against protected tables can evaluate as empty for anon/authenticated visitors;
-- a SECURITY DEFINER helper validates the outlet-owner pair without exposing outlets publicly.
CREATE OR REPLACE FUNCTION public.is_valid_public_outlet_owner(_outlet_id uuid, _owner_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.outlets o
    WHERE o.id = _outlet_id
      AND o.user_id = _owner_id
  );
$$;

DROP POLICY IF EXISTS "Public can create pending orders" ON public.orders;
CREATE POLICY "Public can create pending orders"
ON public.orders
FOR INSERT
TO anon, authenticated
WITH CHECK (
  status = 'pending'
  AND user_id IS NOT NULL
  AND outlet_id IS NOT NULL
  AND public.is_valid_public_outlet_owner(outlet_id, user_id)
);

DROP POLICY IF EXISTS "Public can create active table sessions" ON public.table_sessions;
CREATE POLICY "Public can create active table sessions"
ON public.table_sessions
FOR INSERT
TO anon, authenticated
WITH CHECK (
  status = 'active'
  AND user_id IS NOT NULL
  AND outlet_id IS NOT NULL
  AND public.is_valid_public_outlet_owner(outlet_id, user_id)
);

DROP POLICY IF EXISTS "Public can read active sessions they just opened" ON public.table_sessions;
CREATE POLICY "Public can read active sessions they just opened"
ON public.table_sessions
FOR SELECT
TO anon, authenticated
USING (status = 'active');

GRANT EXECUTE ON FUNCTION public.is_valid_public_outlet_owner(uuid, uuid) TO anon, authenticated;