-- Drop the existing trigger that creates invoices when sessions are closed
DROP TRIGGER IF EXISTS on_table_session_closed ON public.table_sessions;

-- Recreate the function to create invoice AND transaction when session is closed/paid
CREATE OR REPLACE FUNCTION public.create_invoice_for_closed_session()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
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
  -- Trigger when:
  -- 1. Status changes to 'closed' (normal flow)
  -- 2. OR status changes to 'paid' AND there is a debtor_id (debtor flow)
  IF (TG_OP = 'UPDATE' AND 
      ((OLD.status != 'closed' AND NEW.status = 'closed') OR 
       (OLD.status != 'paid' AND NEW.status = 'paid' AND NEW.debtor_id IS NOT NULL))
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
      
      -- Try several times in case of concurrent invoice generation
      FOR attempt IN 1..5 LOOP
        BEGIN
          invoice_num := public.generate_invoice_number();
          
          -- Create invoice with status 'paid' directly (since session is being closed/paid)
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
            'paid',  -- Mark as paid directly since session is closed
            CURRENT_DATE,  -- paid_date is today
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
            -- If there is a conflict, try again with a new number
            CONTINUE;
        END;
      END LOOP;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Recreate the trigger
CREATE TRIGGER on_table_session_closed
AFTER UPDATE ON public.table_sessions
FOR EACH ROW
EXECUTE FUNCTION public.create_invoice_for_closed_session();

-- Also add payment_method column to table_sessions if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'table_sessions' 
    AND column_name = 'payment_method'
  ) THEN
    ALTER TABLE public.table_sessions 
    ADD COLUMN payment_method TEXT DEFAULT 'Espèces';
  END IF;
END $$;