-- Replace team member policies to also allow email-based membership (when member_user_id is null)

DO $$ BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'outlets'
      AND policyname = 'Team members can view owner''s outlets'
  ) THEN
    DROP POLICY "Team members can view owner's outlets" ON public.outlets;
  END IF;
END $$;

CREATE POLICY "Team members can view owner's outlets"
ON public.outlets
FOR SELECT
TO authenticated
USING (
  auth.uid() = user_id
  OR EXISTS (
    SELECT 1 FROM public.team_members tm
    WHERE tm.owner_id = outlets.user_id
      AND (
        tm.member_user_id = auth.uid()
        OR tm.member_email = (auth.jwt() ->> 'email')
      )
      AND tm.is_active = true
      AND tm.status = 'accepted'
  )
);

DO $$ BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'outlets'
      AND policyname = 'Team members can insert outlets for owner'
  ) THEN
    DROP POLICY "Team members can insert outlets for owner" ON public.outlets;
  END IF;
END $$;

CREATE POLICY "Team members can insert outlets for owner"
ON public.outlets
FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() = user_id
  OR EXISTS (
    SELECT 1 FROM public.team_members tm
    WHERE tm.owner_id = user_id
      AND (
        tm.member_user_id = auth.uid()
        OR tm.member_email = (auth.jwt() ->> 'email')
      )
      AND tm.is_active = true
      AND tm.status = 'accepted'
  )
);
