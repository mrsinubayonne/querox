-- 1) Ensure session status follows invoice payment (online + offline sync-safe)
CREATE OR REPLACE FUNCTION public.close_session_on_invoice_paid()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  -- Trigger on INSERT paid OR UPDATE to paid
  IF (
    NEW.session_id IS NOT NULL
    AND NEW.status = 'paid'
    AND (TG_OP = 'INSERT' OR (TG_OP = 'UPDATE' AND COALESCE(OLD.status, '') <> 'paid'))
  ) THEN
    UPDATE public.table_sessions
    SET status = 'paid',
        closed_at = COALESCE(closed_at, now()),
        payment_method = COALESCE(payment_method, NEW.payment_method)
    WHERE id = NEW.session_id
      AND status IN ('active', 'closed');
  END IF;

  RETURN NEW;
END;
$function$;

DROP TRIGGER IF EXISTS trigger_close_session_on_invoice_paid ON public.invoices;
CREATE TRIGGER trigger_close_session_on_invoice_paid
AFTER INSERT OR UPDATE ON public.invoices
FOR EACH ROW
EXECUTE FUNCTION public.close_session_on_invoice_paid();

-- 2) Keep invoice generation on close, but do NOT auto-mark paid
CREATE OR REPLACE FUNCTION public.create_invoice_for_closed_session()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  invoice_num TEXT;
  due_date DATE;
  existing_invoice_id UUID;
  all_items JSONB;
  first_order RECORD;
  debtor_payment_terms INTEGER;
  attempt INTEGER;
  is_debtor_invoice BOOLEAN;
BEGIN
  -- Trigger when status changes to 'closed' OR 'paid'
  IF (
    TG_OP = 'UPDATE'
    AND (
      (OLD.status <> 'closed' AND NEW.status = 'closed')
      OR (OLD.status <> 'paid' AND NEW.status = 'paid')
    )
  ) THEN
    SELECT id INTO existing_invoice_id
    FROM public.invoices
    WHERE session_id = NEW.id
    LIMIT 1;

    IF existing_invoice_id IS NULL THEN
      is_debtor_invoice := (NEW.debtor_id IS NOT NULL);

      IF is_debtor_invoice THEN
        SELECT payment_terms_days INTO debtor_payment_terms
        FROM public.business_customers
        WHERE id = NEW.debtor_id;

        due_date := CURRENT_DATE + INTERVAL '1 day' * COALESCE(debtor_payment_terms, 30);
      ELSE
        debtor_payment_terms := NULL;
        due_date := CURRENT_DATE + INTERVAL '30 days';
      END IF;

      SELECT COALESCE(jsonb_agg(item), '[]'::jsonb) INTO all_items
      FROM (
        SELECT jsonb_array_elements(o.items) AS item
        FROM public.orders o
        WHERE o.session_id = NEW.id
      ) items;

      SELECT customer_name, customer_email, customer_phone
      INTO first_order
      FROM public.orders
      WHERE session_id = NEW.id
      ORDER BY created_at
      LIMIT 1;

      FOR attempt IN 1..5 LOOP
        BEGIN
          invoice_num := public.generate_invoice_number();

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
            payment_terms_days,
            notes,
            customer_name,
            customer_email,
            customer_phone,
            items,
            payment_method
          ) VALUES (
            NEW.user_id,
            NEW.outlet_id,
            NEW.id,
            NEW.debtor_id,
            invoice_num,
            CASE WHEN is_debtor_invoice THEN 'b2b' ELSE 'b2c' END,
            NEW.total_amount,
            'unpaid',
            NULL,
            due_date,
            debtor_payment_terms,
            CONCAT('Facture générée automatiquement pour la table ', NEW.table_number),
            COALESCE(first_order.customer_name, 'Client'),
            first_order.customer_email,
            first_order.customer_phone,
            all_items,
            NULL
          );

          RETURN NEW;
        EXCEPTION
          WHEN unique_violation THEN
            IF attempt < 5 THEN
              CONTINUE;
            ELSE
              RAISE EXCEPTION 'Failed to generate unique invoice number after 5 attempts';
            END IF;
        END;
      END LOOP;
    END IF;
  END IF;

  RETURN NEW;
END;
$function$;

-- 3) One-time data repair: if invoice already paid, session must be paid too
UPDATE public.table_sessions ts
SET status = 'paid',
    closed_at = COALESCE(ts.closed_at, now()),
    payment_method = COALESCE(ts.payment_method, i.payment_method)
FROM public.invoices i
WHERE i.session_id = ts.id
  AND i.status = 'paid'
  AND ts.status IN ('active', 'closed');