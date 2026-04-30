
-- Replace public order policy: validate user via outlets (profiles row may not exist)
DROP POLICY IF EXISTS "Public can create pending orders" ON public.orders;
CREATE POLICY "Public can create pending orders"
ON public.orders
FOR INSERT
TO anon
WITH CHECK (
  status = 'pending'
  AND user_id IS NOT NULL
  AND outlet_id IS NOT NULL
  AND EXISTS (
    SELECT 1 FROM public.outlets o
    WHERE o.id = orders.outlet_id AND o.user_id = orders.user_id
  )
);

-- Replace public table_sessions policy: same fix
DROP POLICY IF EXISTS "Public can create active table sessions" ON public.table_sessions;
CREATE POLICY "Public can create active table sessions"
ON public.table_sessions
FOR INSERT
TO anon
WITH CHECK (
  status = 'active'
  AND user_id IS NOT NULL
  AND outlet_id IS NOT NULL
  AND EXISTS (
    SELECT 1 FROM public.outlets o
    WHERE o.id = table_sessions.outlet_id AND o.user_id = table_sessions.user_id
  )
);

-- Allow anon to read active sessions (already exists, ensure scoped read by outlet not required at insert .select())
DROP POLICY IF EXISTS "Public can read active sessions they just opened" ON public.table_sessions;
CREATE POLICY "Public can read active sessions they just opened"
ON public.table_sessions
FOR SELECT
TO anon
USING (status = 'active');
