
-- Restrict storage 'images' bucket: prevent listing while keeping public read via direct URLs
DROP POLICY IF EXISTS "Public can view images" ON storage.objects;
CREATE POLICY "Users can list their own image folder" ON storage.objects
  FOR SELECT TO authenticated
  USING (bucket_id = 'images' AND (auth.uid())::text = (storage.foldername(name))[1]);

-- Revoke EXECUTE from PUBLIC/anon/authenticated on internal SECURITY DEFINER functions
-- (triggers and internal helpers that should never be called via PostgREST RPC)
DO $$
DECLARE
  fn text;
  fns text[] := ARRAY[
    'public.audit_trigger_function()',
    'public.profiles_assign_restaurant_code()',
    'public.close_session_on_invoice_paid()',
    'public.handle_new_user()',
    'public.update_session_total_on_order_change()',
    'public.create_owner_profile_on_outlet()',
    'public.create_trial_subscription()',
    'public.outlets_set_slug()',
    'public.update_business_customer_debt()',
    'public.create_invoice_for_order()',
    'public.create_transaction_from_paid_invoice()',
    'public.update_access_codes_timestamp()',
    'public.create_default_user_profile()',
    'public.deduct_inventory_from_invoice()',
    'public.profiles_set_restaurant_slug()',
    'public.update_business_customers_updated_at()',
    'public.update_updated_at_column()',
    'public.check_debtor_invoice_fully_paid()',
    'public.create_invoice_for_closed_session()',
    'public.stock_movements_set_user_id()',
    'public.cleanup_rate_limits()',
    'public.cleanup_old_rate_limits()',
    'public.cleanup_stale_table_sessions()',
    'public.admin_revenue_stats_policy()',
    'public.generate_team_access_code()',
    'public.generate_outlet_access_code(uuid, public.outlet_role)',
    'public.generate_purchase_order_number()',
    'public.generate_payslip_number()',
    'public.log_team_activity(uuid, text, text)',
    'public.calculate_churn_rate(integer)'
  ];
BEGIN
  FOREACH fn IN ARRAY fns LOOP
    BEGIN
      EXECUTE format('REVOKE EXECUTE ON FUNCTION %s FROM PUBLIC, anon, authenticated', fn);
    EXCEPTION WHEN undefined_function THEN
      RAISE NOTICE 'Skipped missing function: %', fn;
    END;
  END LOOP;
END$$;
