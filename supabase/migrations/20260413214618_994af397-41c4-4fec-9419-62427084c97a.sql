
-- 1. Attach the trigger for automatic transaction creation on invoice payment
CREATE TRIGGER trigger_create_transaction_from_paid_invoice
  AFTER UPDATE ON public.invoices
  FOR EACH ROW
  EXECUTE FUNCTION public.create_transaction_from_paid_invoice();

-- 2. Delete duplicate OFF-xxx invoices where FAC-xxx exists for same session
DELETE FROM public.invoices
WHERE id IN (
  SELECT i1.id 
  FROM public.invoices i1
  JOIN public.invoices i2 ON i1.session_id = i2.session_id AND i1.id != i2.id
  WHERE i1.invoice_number LIKE 'OFF-%' 
    AND i2.invoice_number LIKE 'FAC-%'
    AND i1.session_id IS NOT NULL
);

-- 3. Delete duplicate transactions (keep most recent per fingerprint)
DELETE FROM public.transactions
WHERE id NOT IN (
  SELECT DISTINCT ON (user_id, title, amount, date) id
  FROM public.transactions
  ORDER BY user_id, title, amount, date, created_at DESC
);

-- 4. Increase cleanup delay from 12h to 24h
CREATE OR REPLACE FUNCTION public.cleanup_stale_table_sessions()
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $$
BEGIN
  UPDATE public.table_sessions 
  SET status = 'paid', 
      closed_at = COALESCE(closed_at, now()),
      payment_method = COALESCE(payment_method, 'Espèces')
  WHERE status IN ('active', 'closed') 
    AND created_at < now() - INTERVAL '24 hours';
END;
$$;
