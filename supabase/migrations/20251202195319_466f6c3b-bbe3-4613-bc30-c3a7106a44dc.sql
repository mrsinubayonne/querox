-- Supprimer les triggers dupliqués sur invoices
DROP TRIGGER IF EXISTS on_invoice_paid_create_transaction ON public.invoices;
DROP TRIGGER IF EXISTS trigger_create_transaction_on_invoice_paid ON public.invoices;

-- Supprimer les triggers dupliqués sur table_sessions
DROP TRIGGER IF EXISTS on_table_session_closed ON public.table_sessions;
DROP TRIGGER IF EXISTS trigger_create_invoice_on_session_close ON public.table_sessions;

-- Garder seulement les triggers principaux:
-- - create_invoice_for_closed_session_trigger sur table_sessions
-- - create_transaction_from_paid_invoice_trigger sur invoices

-- Supprimer les transactions incorrectement créées pour les factures B2B impayées
DELETE FROM public.transactions t
WHERE t.category = 'facture'
AND EXISTS (
  SELECT 1 FROM public.invoices i 
  WHERE t.title = CONCAT('Facture ', i.invoice_number)
  AND i.invoice_type = 'b2b'
  AND i.status = 'unpaid'
);