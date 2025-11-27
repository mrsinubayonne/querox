-- Fix verify_team_access to accept both pending and accepted statuses
-- This allows team members to login with their access code immediately after invitation
CREATE OR REPLACE FUNCTION verify_team_access(
  _email text,
  _access_code text
)
RETURNS TABLE(
  member_id uuid,
  owner_id uuid,
  role text,
  status text
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    id,
    owner_id,
    role,
    status
  FROM public.team_members
  WHERE member_email = _email
    AND access_code = _access_code
    AND is_active = true
    AND status IN ('pending', 'accepted');
$$;