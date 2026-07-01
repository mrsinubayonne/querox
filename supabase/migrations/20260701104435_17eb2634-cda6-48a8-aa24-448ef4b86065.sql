
-- Revoke EXECUTE from anon on all SECURITY DEFINER functions except those needed by public routes
DO $$
DECLARE
  r record;
  keep_anon text[] := ARRAY[
    'get_public_menu_data',
    'get_public_website_by_slug',
    'get_public_website_safe_data',
    'is_menu_publicly_active',
    'resolve_public_menu',
    'verify_outlet_access_code'
  ];
  keep_auth_only_rls text[] := ARRAY[
    -- helpers only used inside RLS policies / other definer funcs - safe to revoke from authenticated
    'is_valid_public_outlet_owner',
    'is_active_team_member_for_owner',
    'team_member_has_outlet_access',
    'team_member_has_any_permission',
    'team_member_can_access',
    'check_team_member_permission',
    'admin_revenue_stats_policy',
    'generate_restaurant_code',
    'generate_team_access_code',
    'generate_outlet_access_code'
  ];
BEGIN
  FOR r IN
    SELECT p.oid, p.proname,
           pg_get_function_identity_arguments(p.oid) AS args
    FROM pg_proc p
    JOIN pg_namespace n ON n.oid = p.pronamespace
    WHERE n.nspname = 'public' AND p.prosecdef = true
  LOOP
    -- Revoke from anon unless in keep list
    IF NOT (r.proname = ANY(keep_anon)) THEN
      EXECUTE format('REVOKE EXECUTE ON FUNCTION public.%I(%s) FROM anon', r.proname, r.args);
      EXECUTE format('REVOKE EXECUTE ON FUNCTION public.%I(%s) FROM PUBLIC', r.proname, r.args);
    END IF;
    -- Revoke from authenticated only for pure RLS/internal helpers
    IF r.proname = ANY(keep_auth_only_rls) THEN
      EXECUTE format('REVOKE EXECUTE ON FUNCTION public.%I(%s) FROM authenticated', r.proname, r.args);
    END IF;
  END LOOP;
END$$;
