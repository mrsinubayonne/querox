-- Fonction pour générer un numéro de facture unique
CREATE OR REPLACE FUNCTION generate_invoice_number()
RETURNS TEXT 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  year TEXT;
  month TEXT;
  random_num TEXT;
BEGIN
  year := TO_CHAR(NOW(), 'YYYY');
  month := TO_CHAR(NOW(), 'MM');
  random_num := LPAD(FLOOR(RANDOM() * 10000)::TEXT, 4, '0');
  RETURN 'INV-' || year || month || '-' || random_num;
END;
$$;

-- Fonction trigger pour créer automatiquement une facture quand une commande est créée
CREATE OR REPLACE FUNCTION create_invoice_for_order()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  invoice_num TEXT;
  due_date DATE;
BEGIN
  -- Générer le numéro de facture
  invoice_num := generate_invoice_number();
  
  -- Calculer la date d'échéance (30 jours)
  due_date := CURRENT_DATE + INTERVAL '30 days';
  
  -- Créer la facture
  INSERT INTO public.invoices (
    user_id,
    order_id,
    invoice_number,
    total_amount,
    status,
    due_date,
    notes
  ) VALUES (
    NEW.user_id,
    NEW.id,
    invoice_num,
    NEW.total_amount,
    'unpaid',
    due_date,
    'Facture générée automatiquement pour la commande'
  );
  
  RETURN NEW;
END;
$$;

-- Créer le trigger sur la table orders
DROP TRIGGER IF EXISTS trigger_create_invoice_on_order ON public.orders;
CREATE TRIGGER trigger_create_invoice_on_order
  AFTER INSERT ON public.orders
  FOR EACH ROW
  EXECUTE FUNCTION create_invoice_for_order();