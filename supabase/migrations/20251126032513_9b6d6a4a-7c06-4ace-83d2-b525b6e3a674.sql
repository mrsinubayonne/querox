-- Ensure triggers are correctly set up for invoices and table sessions
BEGIN;

-- 1) When an invoice is marked as paid from the Factures page, create a transaction
DROP TRIGGER IF EXISTS on_invoice_paid_create_transaction ON public.invoices;

CREATE TRIGGER on_invoice_paid_create_transaction
AFTER UPDATE ON public.invoices
FOR EACH ROW
EXECUTE FUNCTION public.create_transaction_from_paid_invoice();

-- 2) When a table session is closed or marked as paid from the Tables page, ensure an invoice + transaction are created
DROP TRIGGER IF EXISTS on_table_session_closed ON public.table_sessions;

CREATE TRIGGER on_table_session_closed
AFTER UPDATE ON public.table_sessions
FOR EACH ROW
EXECUTE FUNCTION public.create_invoice_for_closed_session();

COMMIT;