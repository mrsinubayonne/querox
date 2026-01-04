-- Update verify_team_access to return proper column aliases including status
CREATE OR REPLACE FUNCTION public.verify_team_access(_email text, _access_code text)
RETURNS TABLE(
  member_id uuid,
  owner_id uuid,
  role text,
  status text,
  outlet_id uuid
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    id AS member_id,
    owner_id,
    role,
    status,
    outlet_id
  FROM public.team_members
  WHERE member_email = _email
    AND access_code = _access_code
    AND is_active = true
    AND status IN ('pending', 'accepted');
$$;