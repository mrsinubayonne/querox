-- Allow anonymous (public menu) customers to create orders
CREATE POLICY "Public can create pending orders"
ON public.orders
FOR INSERT
TO anon
WITH CHECK (
  status = 'pending'
  AND user_id IS NOT NULL
  AND EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = orders.user_id)
);

-- Allow anonymous (public menu) customers to open a table session
CREATE POLICY "Public can create active table sessions"
ON public.table_sessions
FOR INSERT
TO anon
WITH CHECK (
  status = 'active'
  AND user_id IS NOT NULL
  AND EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = table_sessions.user_id)
);

-- Allow public to read back the just-created session id (needed by .select().single())
CREATE POLICY "Public can read active sessions they just opened"
ON public.table_sessions
FOR SELECT
TO anon
USING (status = 'active');
