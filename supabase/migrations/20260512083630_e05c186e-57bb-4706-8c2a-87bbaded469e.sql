DO $$
DECLARE
  v_user_id uuid := 'd6f102fe-cee9-4d54-8913-66d670b41996';
  v_row record;
  v_nv jsonb;
BEGIN
  FOR v_row IN
    SELECT DISTINCT ON (record_id) record_id, new_values, created_at
    FROM public.audit_logs
    WHERE user_id = v_user_id
      AND table_name = 'transactions'
      AND action = 'INSERT'
      AND new_values IS NOT NULL
    ORDER BY record_id, created_at DESC
  LOOP
    IF EXISTS (SELECT 1 FROM public.transactions WHERE id = v_row.record_id) THEN
      CONTINUE;
    END IF;

    v_nv := v_row.new_values;

    INSERT INTO public.transactions (
      id, user_id, outlet_id, title, amount, type, category, status,
      date, description, payment_method, created_at
    )
    VALUES (
      v_row.record_id,
      v_user_id,
      NULLIF(v_nv->>'outlet_id','')::uuid,
      v_nv->>'title',
      COALESCE(NULLIF(v_nv->>'amount','')::numeric, 0),
      COALESCE(NULLIF(v_nv->>'type',''), 'income'),
      COALESCE(NULLIF(v_nv->>'category',''), 'facture'),
      COALESCE(NULLIF(v_nv->>'status',''), 'completed'),
      COALESCE(NULLIF(v_nv->>'date','')::date, CURRENT_DATE),
      v_nv->>'description',
      COALESCE(NULLIF(v_nv->>'payment_method',''), 'Espèces'),
      COALESCE(NULLIF(v_nv->>'created_at','')::timestamptz, now())
    )
    ON CONFLICT (id) DO NOTHING;
  END LOOP;
END $$;