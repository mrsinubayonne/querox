-- Fix concurrent invoice number generation causing duplicate key errors
-- by adding retry logic on unique constraint violations in invoice-creating triggers.

-- Update trigger function for creating invoices from orders
CREATE OR REPLACE FUNCTION public.create_invoice_for_order()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  invoice_num TEXT;
  due_date DATE;
  existing_invoice_id UUID;
  attempt INTEGER;
BEGIN
  IF (TG_OP = 'INSERT') OR 
     (TG_OP = 'UPDATE' AND OLD.status != 'delivered' AND NEW.status = 'delivered') THEN
    
    SELECT id INTO existing_invoice_id
    FROM public.invoices
    WHERE order_id = NEW.id
    LIMIT 1;
    
    IF existing_invoice_id IS NULL THEN
      due_date := CURRENT_DATE + INTERVAL '30 days';
      
      -- Try a few times in case another transaction generated the same invoice number
      FOR attempt IN 1..5 LOOP
        BEGIN
          invoice_num := public.generate_invoice_number();
          
          INSERT INTO public.invoices (
            user_id,
            outlet_id,
            order_id,
            invoice_number,
            total_amount,
            status,
            due_date,
            notes,
            customer_name,
            customer_email,
            customer_phone,
            items
          ) VALUES (
            NEW.user_id,
            NEW.outlet_id,
            NEW.id,
            invoice_num,
            NEW.total_amount,
            'unpaid',
            due_date,
            'Facture générée automatiquement pour la commande',
            NEW.customer_name,
            NEW.customer_email,
            NEW.customer_phone,
            NEW.items
          );
          
          -- Success: exit the function
          RETURN NEW;
        EXCEPTION
          WHEN unique_violation THEN
            -- If the invoice_number (or another unique key) conflicts,
            -- try again with a new number. If another invoice was already
            -- created for this order, further attempts will also fail and
            -- we'll simply exit after the loop.
            CONTINUE;
        END;
      END LOOP;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$function$;

-- Update trigger function for creating invoices from closed/paid table sessions
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
          
          INSERT INTO public.invoices (
            user_id,
            outlet_id,
            session_id,
            business_customer_id,
            invoice_number,
            invoice_type,
            total_amount,
            status,
            due_date,
            payment_terms_days,
            notes,
            customer_name,
            customer_email,
            customer_phone,
            items
          ) VALUES (
            NEW.user_id,
            NEW.outlet_id,
            NEW.id,
            NEW.debtor_id,
            invoice_num,
            CASE WHEN NEW.debtor_id IS NOT NULL THEN 'b2b' ELSE 'b2c' END,
            NEW.total_amount,
            CASE WHEN NEW.debtor_id IS NOT NULL THEN 'unpaid' ELSE 'unpaid' END,
            due_date,
            debtor_payment_terms,
            CONCAT('Facture générée automatiquement pour la table ', NEW.table_number),
            COALESCE(first_order.customer_name, 'Client'),
            first_order.customer_email,
            first_order.customer_phone,
            all_items
          );
          
          -- Success: exit the function
          RETURN NEW;
        EXCEPTION
          WHEN unique_violation THEN
            -- If there is a conflict (invoice_number or session_id already used),
            -- try again with a new number. If another invoice was already
            -- created for this session, subsequent attempts will also fail
            -- and we'll simply exit after the loop.
            CONTINUE;
        END;
      END LOOP;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$function$;