-- Fix invoice number generation with advisory lock and proper retry logic

-- Step 1: Improve generate_invoice_number() function
CREATE OR REPLACE FUNCTION public.generate_invoice_number()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  year TEXT;
  month TEXT;
  next_num INTEGER;
  invoice_num TEXT;
BEGIN
  -- Use advisory lock to prevent concurrent generation
  PERFORM pg_advisory_xact_lock(hashtext('generate_invoice_number'));
  
  year := TO_CHAR(NOW(), 'YYYY');
  month := TO_CHAR(NOW(), 'MM');
  
  -- Get the highest invoice number for this month
  SELECT COALESCE(MAX(
    CAST(
      SUBSTRING(invoice_number FROM '[0-9]+$') AS INTEGER
    )
  ), 0) + 1
  INTO next_num
  FROM invoices
  WHERE invoice_number LIKE 'INV-' || year || month || '-%';
  
  -- Format with 5 digits padding (was 4, now supports 99999 invoices/month)
  invoice_num := 'INV-' || year || month || '-' || LPAD(next_num::TEXT, 5, '0');
  
  RETURN invoice_num;
END;
$function$;

-- Step 2: Improve create_invoice_for_closed_session() with proper retry
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
      -- If a debtor is linked, use their payment terms
      IF NEW.debtor_id IS NOT NULL THEN
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
          
          -- Create invoice with status 'paid' directly
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
            CASE WHEN NEW.debtor_id IS NOT NULL THEN 'b2b' ELSE 'b2c' END,
            NEW.total_amount,
            'paid',
            CURRENT_DATE,
            due_date,
            debtor_payment_terms,
            CONCAT('Facture générée automatiquement pour la table ', NEW.table_number),
            COALESCE(first_order.customer_name, 'Client'),
            first_order.customer_email,
            first_order.customer_phone,
            all_items,
            COALESCE(NEW.payment_method, 'Espèces')
          ) RETURNING id INTO new_invoice_id;
          
          -- Create the transaction immediately for this invoice
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