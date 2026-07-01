GRANT EXECUTE ON FUNCTION public.team_member_has_outlet_access(uuid, uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.team_member_can_access(uuid, uuid, text[]) TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_active_team_member_for_owner(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.team_member_has_any_permission(uuid, text[]) TO authenticated;

REVOKE EXECUTE ON FUNCTION public.team_member_has_outlet_access(uuid, uuid) FROM anon;
REVOKE EXECUTE ON FUNCTION public.team_member_can_access(uuid, uuid, text[]) FROM anon;
REVOKE EXECUTE ON FUNCTION public.is_active_team_member_for_owner(uuid) FROM anon;
REVOKE EXECUTE ON FUNCTION public.team_member_has_any_permission(uuid, text[]) FROM anon;