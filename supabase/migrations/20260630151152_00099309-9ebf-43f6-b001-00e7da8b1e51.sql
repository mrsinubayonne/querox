
-- Revoke anon EXECUTE on SECURITY DEFINER functions that should be authenticated-only.
-- Keeps RLS helpers and truly public RPCs intact.

REVOKE EXECUTE ON FUNCTION public.accept_team_invitation(text, text) FROM anon, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.calculate_reorder_suggestions(uuid, uuid) FROM anon, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.check_team_member_permission(text, text) FROM anon, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.complete_team_member_setup(text, text, text) FROM anon, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.generate_invoice_number() FROM anon, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.generate_restaurant_code() FROM anon, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.get_admin_revenue_stats() FROM anon, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.get_button_usage_stats() FROM anon, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.get_overdue_invoices() FROM anon, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.get_restaurants_total_revenue() FROM anon, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.get_role_permissions(text) FROM anon, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.get_subscription_revenue_stats() FROM anon, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.get_team_member_outlets(uuid) FROM anon, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.get_team_member_permissions(uuid) FROM anon, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.logout_outlet_profile(uuid) FROM anon, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.set_team_member_pin(uuid, text, text) FROM anon, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.track_button_click(text, text) FROM anon, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.verify_team_invitation(text) FROM anon, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.resolve_owner_by_restaurant_code(text) FROM anon, authenticated, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.verify_team_access(text, text) FROM anon, authenticated, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.verify_team_access_pin(uuid, text, text) FROM anon, authenticated, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.team_member_login(text, text) FROM anon, authenticated, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.public_reset_password(text, text) FROM anon, authenticated, PUBLIC;

-- Revoke from authenticated for trigger/internal-only side-effects accidentally exposed
REVOKE EXECUTE ON FUNCTION public.create_transaction_for_paid_salary() FROM anon, authenticated, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.generate_invoice_number() FROM PUBLIC;
