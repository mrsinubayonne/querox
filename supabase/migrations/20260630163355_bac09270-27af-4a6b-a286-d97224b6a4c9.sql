
-- Restrict EXECUTE on SECURITY DEFINER functions
-- Keep only genuinely public ones callable by anon; restrict admin-only ones to service_role

-- Admin-only: remove from anon AND authenticated
REVOKE EXECUTE ON FUNCTION public.get_admin_revenue_stats() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.get_button_usage_stats() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.get_restaurants_total_revenue() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.get_subscription_revenue_stats() FROM PUBLIC, anon, authenticated;

-- Helpers/RPCs that should be authenticated-only (revoke from anon)
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, user_role) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, text) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.is_admin() FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.is_current_user_admin() FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.is_active_team_member_for_owner(uuid) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.team_member_can_access(uuid, uuid, text[]) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.team_member_has_any_permission(uuid, text[]) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.team_member_has_outlet_access(uuid, uuid) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.update_user_access_codes(text, text) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.verify_user_access_code(uuid, text, text) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.verify_profile_access_code(text, text) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.is_valid_public_outlet_owner(uuid, uuid) FROM PUBLIC, anon;
