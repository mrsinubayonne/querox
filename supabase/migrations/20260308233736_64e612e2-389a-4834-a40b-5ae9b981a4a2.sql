
-- ============================================================
-- FIX 1: profile_access_codes - Remove overly permissive read policy
-- Any authenticated user could read ALL access codes
-- ============================================================
DROP POLICY IF EXISTS "Users can view active codes" ON public.profile_access_codes;

-- Replace with admin-only read
CREATE POLICY "Only admins can view access codes"
ON public.profile_access_codes
FOR SELECT
TO authenticated
USING (public.is_admin());

-- ============================================================
-- FIX 2: orders - Remove public INSERT with true
-- Anonymous users could inject orders into any user's history
-- ============================================================
DROP POLICY IF EXISTS "Public users can create orders" ON public.orders;

-- Allow authenticated users to create their own orders only
CREATE POLICY "Authenticated users can create own orders"
ON public.orders
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- For public menu ordering (anonymous), enforce null user_id or use a service role
-- If public ordering is needed, create a secure edge function instead

-- ============================================================
-- FIX 3: table_sessions - Remove public INSERT with true  
-- Anonymous users could create sessions attributed to any user
-- ============================================================
DROP POLICY IF EXISTS "Public can create table sessions" ON public.table_sessions;

-- Only authenticated users can create their own sessions
CREATE POLICY "Authenticated users can create own sessions"
ON public.table_sessions
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);
