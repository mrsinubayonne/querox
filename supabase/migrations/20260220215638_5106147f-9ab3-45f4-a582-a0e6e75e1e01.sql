-- Drop the existing restrictive policy
DROP POLICY IF EXISTS "Users can manage their own table sessions" ON public.table_sessions;

-- Create a new policy that allows both owners AND their team members
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