
-- Drop the restrictive policy
DROP POLICY IF EXISTS "Users and team members can manage table sessions" ON public.table_sessions;

-- Recreate as PERMISSIVE (default) so it actually grants access
CREATE POLICY "Users and team members can manage table sessions"
ON public.table_sessions
FOR ALL
USING (
  auth.uid() = user_id 
  OR EXISTS (
    SELECT 1 FROM team_members tm
    WHERE tm.owner_id = table_sessions.user_id
    AND (tm.member_user_id = auth.uid() OR tm.member_email = (auth.jwt() ->> 'email'::text))
    AND tm.is_active = true
    AND tm.status = 'accepted'
  )
)
WITH CHECK (
  auth.uid() = user_id 
  OR EXISTS (
    SELECT 1 FROM team_members tm
    WHERE tm.owner_id = table_sessions.user_id
    AND (tm.member_user_id = auth.uid() OR tm.member_email = (auth.jwt() ->> 'email'::text))
    AND tm.is_active = true
    AND tm.status = 'accepted'
  )
);

-- Also make the INSERT policy permissive
DROP POLICY IF EXISTS "Public can create table sessions" ON public.table_sessions;
CREATE POLICY "Public can create table sessions"
ON public.table_sessions
FOR INSERT
WITH CHECK (true);
