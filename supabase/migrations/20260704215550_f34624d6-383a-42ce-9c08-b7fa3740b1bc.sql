CREATE OR REPLACE FUNCTION public.mark_table_session_paid(_session_id uuid, _payment_method text DEFAULT 'Espèces')
RETURNS TABLE(session_id uuid, invoice_id uuid, is_debtor boolean)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_session public.table_sessions%ROWTYPE;
  v_invoice public.invoices%ROWTYPE;
  v_items jsonb := '[]'::jsonb;
  v_customer record;
  v_invoice_num text;
  v_payment_method text := COALESCE(NULLIF(_payment_method, ''), 'Espèces');
  v_authorized boolean := false;
BEGIN
  SELECT * INTO v_session
  FROM public.table_sessions
  WHERE id = _session_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Session introuvable';
  END IF;

  v_authorized := v_session.user_id = auth.uid();

  IF NOT v_authorized THEN
    v_authorized := public.team_member_can_access(
      v_session.user_id,
      v_session.outlet_id,
      ARRAY['manage_tables','manage_orders','manage_invoices']
    );
  END IF;

  IF NOT v_authorized THEN
    RAISE EXCEPTION 'Non autorisé';
  END IF;

  SELECT * INTO v_invoice
  FROM public.invoices i
  WHERE i.session_id = _session_id
  ORDER BY i.created_at DESC
  LIMIT 1;

  IF NOT FOUND THEN
    SELECT COALESCE(jsonb_agg(item), '[]'::jsonb) INTO v_items
    FROM (
      SELECT jsonb_array_elements(COALESCE(o.items, '[]'::jsonb)) AS item
      FROM public.orders o
      WHERE o.session_id = _session_id
      ORDER BY o.created_at ASC
    ) items;

    SELECT o.customer_name, o.customer_email, o.customer_phone INTO v_customer
    FROM public.orders o
    WHERE o.session_id = _session_id
    ORDER BY o.created_at ASC
    LIMIT 1;

    v_invoice_num := public.generate_invoice_number();

    INSERT INTO public.invoices (
      user_id,
      outlet_id,
      session_id,
      business_customer_id,
      invoice_number,
      invoice_type,
      total_amount,
      status,
      paid_date,
      due_date,
      notes,
      customer_name,
      customer_email,
      customer_phone,
      items,
      payment_method
    ) VALUES (
      v_session.user_id,
      v_session.outlet_id,
      _session_id,
      v_session.debtor_id,
      v_invoice_num,
      CASE WHEN v_session.debtor_id IS NOT NULL THEN 'b2b' ELSE 'b2c' END,
      COALESCE(v_session.total_amount, 0),
      CASE WHEN v_session.debtor_id IS NOT NULL THEN 'unpaid' ELSE 'paid' END,
      CASE WHEN v_session.debtor_id IS NOT NULL THEN NULL ELSE CURRENT_DATE END,
      CURRENT_DATE,
      CONCAT('Facture générée automatiquement pour la table ', v_session.table_number),
      COALESCE(v_customer.customer_name, 'Table ' || v_session.table_number),
      v_customer.customer_email,
      v_customer.customer_phone,
      COALESCE(v_items, '[]'::jsonb),
      v_payment_method
    ) RETURNING * INTO v_invoice;
  ELSIF v_session.debtor_id IS NULL THEN
    UPDATE public.invoices
    SET status = 'paid',
        paid_date = COALESCE(paid_date, CURRENT_DATE),
        payment_method = v_payment_method,
        total_amount = COALESCE(NULLIF(total_amount, 0), COALESCE(v_session.total_amount, 0)),
        updated_at = now()
    WHERE id = v_invoice.id
    RETURNING * INTO v_invoice;
  END IF;

  UPDATE public.table_sessions
  SET status = 'paid',
      payment_method = v_payment_method,
      closed_at = COALESCE(closed_at, now()),
      updated_at = now()
  WHERE id = _session_id
  RETURNING * INTO v_session;

  RETURN QUERY SELECT v_session.id, v_invoice.id, (v_session.debtor_id IS NOT NULL);
END;
$$;

REVOKE ALL ON FUNCTION public.mark_table_session_paid(uuid, text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.mark_table_session_paid(uuid, text) TO authenticated;

UPDATE public.invoices i
SET status = 'paid',
    paid_date = COALESCE(i.paid_date, CURRENT_DATE),
    payment_method = COALESCE(i.payment_method, ts.payment_method, 'Espèces'),
    updated_at = now()
FROM public.table_sessions ts
WHERE i.session_id = ts.id
  AND ts.status = 'paid'
  AND ts.debtor_id IS NULL
  AND i.status <> 'paid';