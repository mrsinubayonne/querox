
DROP FUNCTION IF EXISTS public.team_member_login(text, text);

CREATE OR REPLACE FUNCTION public.team_member_login(_email text, _access_code text)
 RETURNS TABLE(member_id uuid, owner_id uuid, role text, status text)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  RETURN QUERY
  UPDATE public.team_members tm
  SET last_login_at = now()
  WHERE tm.member_email = lower(_email)
    AND tm.is_active = true
    AND (
      tm.access_code = _access_code
      OR (tm.access_code LIKE '$2%' AND tm.access_code = crypt(_access_code, tm.access_code))
    )
  RETURNING tm.id, tm.owner_id, tm.role, tm.status;
END;
$function$;
