-- Ajouter outlet_id à la table menus
ALTER TABLE public.menus
ADD COLUMN outlet_id uuid REFERENCES public.outlets(id);

-- Créer une fonction pour générer automatiquement une transaction quand une facture est payée
CREATE OR REPLACE FUNCTION public.create_transaction_from_paid_invoice()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  existing_transaction_id UUID;
BEGIN
  -- Vérifier si c'est un UPDATE vers 'paid'
  IF (TG_OP = 'UPDATE' AND OLD.status != 'paid' AND NEW.status = 'paid') THEN
    
    -- Vérifier qu'une transaction n'existe pas déjà pour cette facture
    SELECT id INTO existing_transaction_id
    FROM public.transactions
    WHERE category = 'facture'
      AND title = CONCAT('Facture ', NEW.invoice_number)
      AND user_id = NEW.user_id
    LIMIT 1;
    
    -- Si aucune transaction n'existe, en créer une
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
        description
      ) VALUES (
        NEW.user_id,
        NEW.outlet_id,
        CONCAT('Facture ', NEW.invoice_number),
        NEW.total_amount,
        'income',
        'facture',
        'completed',
        COALESCE(NEW.paid_date, CURRENT_DATE),
        CONCAT('Paiement de la facture ', NEW.invoice_number)
      );
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Créer le trigger pour créer une transaction quand une facture est payée
DROP TRIGGER IF EXISTS trigger_create_transaction_on_invoice_paid ON public.invoices;
CREATE TRIGGER trigger_create_transaction_on_invoice_paid
AFTER UPDATE ON public.invoices
FOR EACH ROW
EXECUTE FUNCTION public.create_transaction_from_paid_invoice();

-- Créer les transactions pour les factures déjà payées qui n'ont pas de transaction
INSERT INTO public.transactions (
  user_id,
  outlet_id,
  title,
  amount,
  type,
  category,
  status,
  date,
  description
)
SELECT 
  i.user_id,
  i.outlet_id,
  CONCAT('Facture ', i.invoice_number),
  i.total_amount,
  'income',
  'facture',
  'completed',
  COALESCE(i.paid_date, i.updated_at::date),
  CONCAT('Paiement de la facture ', i.invoice_number)
FROM public.invoices i
LEFT JOIN public.transactions t ON (
  t.category = 'facture' 
  AND t.title = CONCAT('Facture ', i.invoice_number)
  AND t.user_id = i.user_id
)
WHERE i.status = 'paid'
  AND t.id IS NULL;