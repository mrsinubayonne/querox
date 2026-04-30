-- Allow ANY role (anon + authenticated) to create pending orders for the public menu
DROP POLICY IF EXISTS "Public can create pending orders" ON public.orders;
CREATE POLICY "Public can create pending orders"
ON public.orders
FOR INSERT
TO anon, authenticated
WITH CHECK (
  status = 'pending'
  AND user_id IS NOT NULL
  AND outlet_id IS NOT NULL
  AND EXISTS (
    SELECT 1 FROM public.outlets o
    WHERE o.id = orders.outlet_id AND o.user_id = orders.user_id
  )
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
  AND EXISTS (
    SELECT 1 FROM public.outlets o
    WHERE o.id = table_sessions.outlet_id AND o.user_id = table_sessions.user_id
  )
);

DROP POLICY IF EXISTS "Public can read active sessions they just opened" ON public.table_sessions;
CREATE POLICY "Public can read active sessions they just opened"
ON public.table_sessions
FOR SELECT
TO anon, authenticated
USING (status = 'active');