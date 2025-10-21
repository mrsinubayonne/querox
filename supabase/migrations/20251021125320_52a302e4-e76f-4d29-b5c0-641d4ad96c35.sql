-- Supprimer l'ancien trigger
DROP TRIGGER IF EXISTS trigger_create_invoice_on_order ON public.orders;

-- Recréer la fonction pour gérer aussi les updates
CREATE OR REPLACE FUNCTION public.create_invoice_for_order()
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
  -- Vérifier si c'est un INSERT ou un UPDATE vers 'delivered'
  IF (TG_OP = 'INSERT') OR 
     (TG_OP = 'UPDATE' AND OLD.status != 'delivered' AND NEW.status = 'delivered') THEN
    
    -- Vérifier qu'une facture n'existe pas déjà pour cette commande
    SELECT id INTO existing_invoice_id
    FROM public.invoices
    WHERE order_id = NEW.id
    LIMIT 1;
    
    -- Si aucune facture n'existe, en créer une
    IF existing_invoice_id IS NULL THEN
      -- Générer le numéro de facture
      invoice_num := generate_invoice_number();
      
      -- Calculer la date d'échéance (30 jours)
      due_date := CURRENT_DATE + INTERVAL '30 days';
      
      -- Créer la facture
      INSERT INTO public.invoices (
        user_id,
        outlet_id,
        order_id,
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
        'Facture générée automatiquement pour la commande'
      );
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Créer le nouveau trigger pour INSERT
CREATE TRIGGER trigger_create_invoice_on_order
AFTER INSERT ON public.orders
FOR EACH ROW
EXECUTE FUNCTION public.create_invoice_for_order();

-- Créer le trigger pour UPDATE
CREATE TRIGGER trigger_create_invoice_on_order_update
AFTER UPDATE ON public.orders
FOR EACH ROW
EXECUTE FUNCTION public.create_invoice_for_order();

-- Créer les factures manquantes pour les commandes delivered existantes
INSERT INTO public.invoices (
  user_id,
  outlet_id,
  order_id,
  invoice_number,
  total_amount,
  status,
  due_date,
  notes
)
SELECT 
  o.user_id,
  o.outlet_id,
  o.id,
  generate_invoice_number(),
  o.total_amount,
  'unpaid',
  CURRENT_DATE + INTERVAL '30 days',
  'Facture générée automatiquement pour commande livrée'
FROM public.orders o
LEFT JOIN public.invoices i ON o.id = i.order_id
WHERE o.status = 'delivered'
  AND i.id IS NULL;