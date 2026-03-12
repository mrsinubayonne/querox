
DO $$
DECLARE
  v_user_id uuid := '328c736d-b113-4f18-80eb-b8b846e6a685'::uuid;
  v_outlet_id uuid := '4b90c488-8bfa-4e0e-91a3-3ff83225f3d3'::uuid;
BEGIN
  -- Clean remaining VIP LA LOYA data
  DELETE FROM public.invoices WHERE user_id = v_user_id AND outlet_id = v_outlet_id;
  DELETE FROM public.orders WHERE user_id = v_user_id AND outlet_id = v_outlet_id;
  DELETE FROM public.table_sessions WHERE user_id = v_user_id AND outlet_id = v_outlet_id;
  DELETE FROM public.transactions WHERE user_id = v_user_id AND outlet_id = v_outlet_id;
  DELETE FROM public.business_periods WHERE user_id = v_user_id AND outlet_id = v_outlet_id;
  DELETE FROM public.reservations WHERE user_id = v_user_id AND outlet_id = v_outlet_id;
  DELETE FROM public.customers WHERE user_id = v_user_id AND outlet_id = v_outlet_id;
END $$;
