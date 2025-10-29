-- Trigger 1: Mettre à jour automatiquement le total de la session quand des commandes changent
CREATE OR REPLACE FUNCTION public.update_session_total_on_order_change()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Si une session_id existe, recalculer le total
  IF TG_OP = 'DELETE' THEN
    IF OLD.session_id IS NOT NULL THEN
      UPDATE public.table_sessions
      SET total_amount = COALESCE((
        SELECT SUM(total_amount)
        FROM public.orders
        WHERE session_id = OLD.session_id
      ), 0)
      WHERE id = OLD.session_id;
    END IF;
    RETURN OLD;
  ELSE
    IF NEW.session_id IS NOT NULL THEN
      UPDATE public.table_sessions
      SET total_amount = COALESCE((
        SELECT SUM(total_amount)
        FROM public.orders
        WHERE session_id = NEW.session_id
      ), 0)
      WHERE id = NEW.session_id;
    END IF;
    RETURN NEW;
  END IF;
END;
$$;

-- Créer le trigger sur la table orders
DROP TRIGGER IF EXISTS trigger_update_session_total ON public.orders;
CREATE TRIGGER trigger_update_session_total
AFTER INSERT OR UPDATE OR DELETE ON public.orders
FOR EACH ROW
EXECUTE FUNCTION public.update_session_total_on_order_change();

-- Trigger 2: Générer automatiquement une facture quand une session est fermée
CREATE OR REPLACE FUNCTION public.create_invoice_for_closed_session()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  invoice_num TEXT;
  due_date DATE;
  existing_invoice_id UUID;
BEGIN
  -- Vérifier si le statut passe à 'closed'
  IF (TG_OP = 'UPDATE' AND OLD.status != 'closed' AND NEW.status = 'closed') THEN
    
    -- Vérifier qu'une facture n'existe pas déjà pour cette session
    SELECT id INTO existing_invoice_id
    FROM public.invoices
    WHERE session_id = NEW.id
    LIMIT 1;
    
    -- Si aucune facture n'existe, en créer une
    IF existing_invoice_id IS NULL THEN
      -- Générer le numéro de facture
      invoice_num := public.generate_invoice_number();
      
      -- Calculer la date d'échéance (30 jours)
      due_date := CURRENT_DATE + INTERVAL '30 days';
      
      -- Créer la facture
      INSERT INTO public.invoices (
        user_id,
        outlet_id,
        session_id,
        invoice_number,
        total_amount,
        status,
        due_date,
        notes
      ) VALUES (
        NEW.user_id,
        NEW.outlet_id,
        NEW.id,
        invoice_num,
        NEW.total_amount,
        'unpaid',
        due_date,
        CONCAT('Facture générée automatiquement pour la table ', NEW.table_number)
      );
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Créer le trigger sur la table table_sessions
DROP TRIGGER IF EXISTS trigger_create_invoice_on_session_close ON public.table_sessions;
CREATE TRIGGER trigger_create_invoice_on_session_close
AFTER UPDATE ON public.table_sessions
FOR EACH ROW
EXECUTE FUNCTION public.create_invoice_for_closed_session();