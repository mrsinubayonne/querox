-- Create trigger to automatically generate an invoice when a table session is closed or marked as paid
CREATE TRIGGER create_invoice_for_closed_session_trigger
AFTER UPDATE ON public.table_sessions
FOR EACH ROW
EXECUTE FUNCTION public.create_invoice_for_closed_session();