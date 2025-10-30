-- Créer une fonction pour libérer la table automatiquement quand la facture est payée
CREATE OR REPLACE FUNCTION public.close_session_on_invoice_paid()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  -- Si la facture passe à "paid" et qu'elle est liée à une session
  IF (TG_OP = 'UPDATE' AND OLD.status != 'paid' AND NEW.status = 'paid' AND NEW.session_id IS NOT NULL) THEN
    -- Fermer la session de table
    UPDATE public.table_sessions
    SET status = 'closed',
        closed_at = now()
    WHERE id = NEW.session_id
      AND status = 'active';
  END IF;
  
  RETURN NEW;
END;
$function$;

-- Créer le trigger sur la table invoices
DROP TRIGGER IF EXISTS trigger_close_session_on_invoice_paid ON public.invoices;
CREATE TRIGGER trigger_close_session_on_invoice_paid
  AFTER UPDATE ON public.invoices
  FOR EACH ROW
  EXECUTE FUNCTION public.close_session_on_invoice_paid();