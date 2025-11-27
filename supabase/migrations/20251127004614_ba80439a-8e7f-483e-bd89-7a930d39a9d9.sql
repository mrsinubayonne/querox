-- Replace verify_team_access to include outlet_id in the return type
-- Need to drop the old version first because Postgres does not allow changing
-- the OUT parameter row type with CREATE OR REPLACE
DROP FUNCTION IF EXISTS public.verify_team_access(text, text);

CREATE FUNCTION public.verify_team_access(
  _email text,
  _access_code text
)
RETURNS TABLE(
  member_id uuid,
  owner_id uuid,
  role text,
  status text,
  outlet_id uuid
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
  SELECT 
    id,
    owner_id,
    role,
    status,
    outlet_id
  FROM public.team_members
  WHERE member_email = _email
    AND access_code = _access_code
    AND is_active = true
    AND status IN ('pending', 'accepted');
$function$;