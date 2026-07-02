-- Paiement table atomique + annonces globales admin

CREATE OR REPLACE FUNCTION public.mark_table_session_paid(_session_id uuid, _payment_method text DEFAULT 'Espèces')
RETURNS TABLE(session_id uuid, invoice_id uuid, is_debtor boolean)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_session public.table_sessions%ROWTYPE;
  v_invoice public.invoices%ROWTYPE;
  v_items jsonb;
  v_customer record;
  v_invoice_num text;
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
      ARRAY['manage_tables','manage_orders']
    );
  END IF;

  IF NOT v_authorized THEN
    RAISE EXCEPTION 'Non autorisé';
  END IF;

  UPDATE public.table_sessions
  SET status = 'paid',
      payment_method = COALESCE(NULLIF(_payment_method, ''), 'Espèces'),
      closed_at = COALESCE(closed_at, now()),
      updated_at = now()
  WHERE id = _session_id
  RETURNING * INTO v_session;

  SELECT * INTO v_invoice
  FROM public.invoices
  WHERE invoices.session_id = _session_id
  ORDER BY created_at DESC
  LIMIT 1;

  IF v_session.debtor_id IS NULL THEN
    IF NOT FOUND THEN
      SELECT COALESCE(jsonb_agg(item), '[]'::jsonb) INTO v_items
      FROM (
        SELECT jsonb_array_elements(o.items) AS item
        FROM public.orders o
        WHERE o.session_id = _session_id
      ) items;

      SELECT customer_name, customer_email, customer_phone INTO v_customer
      FROM public.orders
      WHERE session_id = _session_id
      ORDER BY created_at ASC
      LIMIT 1;

      v_invoice_num := public.generate_invoice_number();

      INSERT INTO public.invoices (
        user_id, outlet_id, session_id, invoice_number, invoice_type,
        total_amount, status, paid_date, due_date, notes,
        customer_name, customer_email, customer_phone, items, payment_method
      ) VALUES (
        v_session.user_id, v_session.outlet_id, _session_id, v_invoice_num, 'b2c',
        COALESCE(v_session.total_amount, 0), 'paid', CURRENT_DATE, CURRENT_DATE,
        CONCAT('Facture générée automatiquement pour la table ', v_session.table_number),
        COALESCE(v_customer.customer_name, 'Client'), v_customer.customer_email, v_customer.customer_phone,
        COALESCE(v_items, '[]'::jsonb), COALESCE(NULLIF(_payment_method, ''), 'Espèces')
      ) RETURNING * INTO v_invoice;
    ELSE
      UPDATE public.invoices
      SET status = 'paid',
          paid_date = COALESCE(paid_date, CURRENT_DATE),
          payment_method = COALESCE(NULLIF(_payment_method, ''), 'Espèces'),
          updated_at = now()
      WHERE id = v_invoice.id
      RETURNING * INTO v_invoice;
    END IF;
  END IF;

  RETURN QUERY SELECT v_session.id, v_invoice.id, (v_session.debtor_id IS NOT NULL);
END;
$$;

REVOKE ALL ON FUNCTION public.mark_table_session_paid(uuid, text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.mark_table_session_paid(uuid, text) TO authenticated;

CREATE TABLE IF NOT EXISTS public.app_announcements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL DEFAULT 'Annonce',
  message text NOT NULL,
  is_active boolean NOT NULL DEFAULT true,
  starts_at timestamptz NOT NULL DEFAULT now(),
  ends_at timestamptz,
  created_by uuid REFERENCES auth.users(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.app_announcements ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Authenticated users can read active announcements" ON public.app_announcements;
CREATE POLICY "Authenticated users can read active announcements"
ON public.app_announcements FOR SELECT TO authenticated
USING (
  is_active = true
  AND starts_at <= now()
  AND (ends_at IS NULL OR ends_at > now())
);

DROP POLICY IF EXISTS "Admins can manage announcements" ON public.app_announcements;
CREATE POLICY "Admins can manage announcements"
ON public.app_announcements FOR ALL TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());
