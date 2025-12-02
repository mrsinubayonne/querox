-- Drop and recreate the trigger function to ensure debtor invoices don't create transactions on creation
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
  new_invoice_id UUID;
  is_debtor_invoice BOOLEAN;
BEGIN
  -- Trigger when status changes to 'closed' OR 'paid'
  IF (TG_OP = 'UPDATE' AND 
      ((OLD.status != 'closed' AND NEW.status = 'closed') OR 
       (OLD.status != 'paid' AND NEW.status = 'paid'))
     ) THEN
    
    -- Check if an invoice already exists for this session
    SELECT id INTO existing_invoice_id
    FROM public.invoices
    WHERE session_id = NEW.id
    LIMIT 1;
    
    IF existing_invoice_id IS NULL THEN
      -- Determine if this is a debtor invoice
      is_debtor_invoice := (NEW.debtor_id IS NOT NULL);
      
      -- If a debtor is linked, use their payment terms
      IF is_debtor_invoice THEN
        SELECT payment_terms_days INTO debtor_payment_terms
        FROM public.business_customers
        WHERE id = NEW.debtor_id;
        
        due_date := CURRENT_DATE + INTERVAL '1 day' * COALESCE(debtor_payment_terms, 30);
      ELSE
        due_date := CURRENT_DATE + INTERVAL '30 days';
      END IF;
      
      -- Aggregate all order items for this session
      SELECT 
        COALESCE(jsonb_agg(item), '[]'::jsonb) INTO all_items
      FROM (
        SELECT jsonb_array_elements(o.items) as item
        FROM public.orders o
        WHERE o.session_id = NEW.id
      ) items;
      
      -- Get customer info from the first order
      SELECT customer_name, customer_email, customer_phone
      INTO first_order
      FROM public.orders
      WHERE session_id = NEW.id
      ORDER BY created_at
      LIMIT 1;
      
      -- Retry loop with invoice number regeneration on each attempt
      FOR attempt IN 1..5 LOOP
        BEGIN
          -- CRITICAL: Generate new invoice number on EACH attempt
          invoice_num := public.generate_invoice_number();
          
          -- Create invoice - status depends on whether it's a debtor invoice
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
            CASE WHEN is_debtor_invoice THEN 'unpaid' ELSE 'paid' END,
            CASE WHEN is_debtor_invoice THEN NULL ELSE CURRENT_DATE END,
            due_date,
            debtor_payment_terms,
            CONCAT('Facture générée automatiquement pour la table ', NEW.table_number),
            COALESCE(first_order.customer_name, 'Client'),
            first_order.customer_email,
            first_order.customer_phone,
            all_items,
            CASE WHEN is_debtor_invoice THEN NULL ELSE COALESCE(NEW.payment_method, 'Espèces') END
          ) RETURNING id INTO new_invoice_id;
          
          -- CRITICAL: Only create transaction for NON-debtor invoices
          -- Debtor transactions are created by check_debtor_invoice_fully_paid() when payment is complete
          IF NOT is_debtor_invoice THEN
            INSERT INTO public.transactions (
              user_id,
              outlet_id,
              title,
              amount,
              type,
              category,
              status,
              date,
              description,
              payment_method
            ) VALUES (
              NEW.user_id,
              NEW.outlet_id,
              CONCAT('Facture ', invoice_num),
              NEW.total_amount,
              'income',
              'facture',
              'completed',
              CURRENT_DATE,
              CONCAT('Paiement de la facture ', invoice_num),
              COALESCE(NEW.payment_method, 'Espèces')
            );
          END IF;
          
          -- Success: exit the function
          RETURN NEW;
          
        EXCEPTION
          WHEN unique_violation THEN
            -- If there is a unique constraint violation, retry with a new number
            IF attempt < 5 THEN
              CONTINUE;
            ELSE
              -- After 5 attempts, raise the error
              RAISE EXCEPTION 'Failed to generate unique invoice number after 5 attempts';
            END IF;
        END;
      END LOOP;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$function$;

-- Also delete the incorrect transaction that was created for the unpaid debtor invoice
DELETE FROM public.transactions 
WHERE title = 'Facture INV-202512-00047' 
  AND category = 'facture';