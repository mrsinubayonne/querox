
-- Fix: Remove transaction creation from check_debtor_invoice_fully_paid trigger
-- The client-side (useDebtorPayments) already creates a transaction for each partial payment.
-- Having the trigger ALSO create a transaction for the full invoice amount causes double-counting.
CREATE OR REPLACE FUNCTION public.check_debtor_invoice_fully_paid()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  total_paid numeric;
  invoice_total numeric;
  invoice_record RECORD;
BEGIN
  -- Get total paid for this invoice
  SELECT COALESCE(SUM(amount), 0) INTO total_paid
  FROM public.debtor_payments
  WHERE invoice_id = NEW.invoice_id;
  
  -- Get invoice info
  SELECT * INTO invoice_record
  FROM public.invoices
  WHERE id = NEW.invoice_id;
  
  invoice_total := invoice_record.total_amount;
  
  -- If total paid >= invoice amount, mark as paid
  IF total_paid >= invoice_total THEN
    -- Update invoice status
    UPDATE public.invoices
    SET status = 'paid',
        paid_date = CURRENT_DATE,
        payment_method = NEW.payment_method
    WHERE id = NEW.invoice_id;
    
    -- Update debtor's current_debt
    UPDATE public.business_customers
    SET current_debt = GREATEST(0, current_debt - invoice_total)
    WHERE id = invoice_record.business_customer_id;
    
    -- NOTE: No transaction creation here!
    -- Each partial payment already creates its own transaction
    -- via the client-side useDebtorPayments hook.
    -- Creating one here for the full amount would cause double-counting.
  END IF;
  
  RETURN NEW;
END;
$function$;
