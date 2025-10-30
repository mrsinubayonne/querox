-- Extend RLS on outlets to allow active team members to act on behalf of the owner

-- Policy: Team members can view owner's outlets
CREATE POLICY "Team members can view owner's outlets"
ON public.outlets
FOR SELECT
TO authenticated
USING (
  auth.uid() = user_id
  OR EXISTS (
    SELECT 1 FROM public.team_members tm
    WHERE tm.owner_id = outlets.user_id
      AND tm.member_user_id = auth.uid()
      AND tm.is_active = true
  )
);

-- Policy: Team members can insert outlets for owner
CREATE POLICY "Team members can insert outlets for owner"
ON public.outlets
FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() = user_id
  OR EXISTS (
    SELECT 1 FROM public.team_members tm
    WHERE tm.owner_id = user_id
      AND tm.member_user_id = auth.uid()
      AND tm.is_active = true
  )
);
