-- Restore owner access to their own table_sessions (regression from 2026-05-12 RLS hardening).
-- Without these policies, owners could create sessions but never see, update, or delete them,
-- which made tables appear to free themselves immediately after opening.

DROP POLICY IF EXISTS "Owners can view their own table sessions" ON public.table_sessions;
CREATE POLICY "Owners can view their own table sessions"
ON public.table_sessions
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Owners can update their own table sessions" ON public.table_sessions;
CREATE POLICY "Owners can update their own table sessions"
ON public.table_sessions
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Owners can delete their own table sessions" ON public.table_sessions;
CREATE POLICY "Owners can delete their own table sessions"
ON public.table_sessions
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);