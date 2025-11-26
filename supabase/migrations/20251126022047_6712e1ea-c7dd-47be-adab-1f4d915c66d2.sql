-- Fix: Copy payment_method from invoice to transaction
CREATE OR REPLACE FUNCTION public.create_transaction_from_paid_invoice()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  existing_transaction_id UUID;
BEGIN
  -- Check if this is an UPDATE to 'paid' status
  IF (TG_OP = 'UPDATE' AND OLD.status != 'paid' AND NEW.status = 'paid') THEN
    
    -- Check if a transaction already exists for this invoice
    SELECT id INTO existing_transaction_id
    FROM public.transactions
    WHERE category = 'facture'
      AND title = CONCAT('Facture ', NEW.invoice_number)
      AND user_id = NEW.user_id
    LIMIT 1;
    
    -- If no transaction exists, create one with payment_method from invoice
    IF existing_transaction_id IS NULL THEN
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
        CONCAT('Facture ', NEW.invoice_number),
        NEW.total_amount,
        'income',
        'facture',
        'completed',
        COALESCE(NEW.paid_date, CURRENT_DATE),
        CONCAT('Paiement de la facture ', NEW.invoice_number),
        COALESCE(NEW.payment_method, 'Espèces')
      );
    END IF;
  END IF;
  
  RETURN NEW;
END;
$function$;