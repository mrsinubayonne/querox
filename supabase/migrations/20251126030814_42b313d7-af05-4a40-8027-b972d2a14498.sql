-- Create trigger to automatically create a transaction when an invoice is marked as paid
CREATE TRIGGER on_invoice_paid_create_transaction
AFTER UPDATE ON public.invoices
FOR EACH ROW
EXECUTE FUNCTION public.create_transaction_from_paid_invoice();