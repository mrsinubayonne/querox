-- Ajouter les colonnes pour stocker les infos client et items dans invoices
ALTER TABLE public.invoices 
ADD COLUMN IF NOT EXISTS customer_name TEXT,
ADD COLUMN IF NOT EXISTS customer_email TEXT,
ADD COLUMN IF NOT EXISTS customer_phone TEXT,
ADD COLUMN IF NOT EXISTS items JSONB DEFAULT '[]'::jsonb;

-- Modifier le trigger pour copier les infos lors de la création de facture depuis une commande
CREATE OR REPLACE FUNCTION public.create_invoice_for_order()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  invoice_num TEXT;
  due_date DATE;
  existing_invoice_id UUID;
BEGIN
  IF (TG_OP = 'INSERT') OR 
     (TG_OP = 'UPDATE' AND OLD.status != 'delivered' AND NEW.status = 'delivered') THEN
    
    SELECT id INTO existing_invoice_id
    FROM public.invoices
    WHERE order_id = NEW.id
    LIMIT 1;
    
    IF existing_invoice_id IS NULL THEN
      invoice_num := generate_invoice_number();
      due_date := CURRENT_DATE + INTERVAL '30 days';
      
      INSERT INTO public.invoices (
        user_id,
        outlet_id,
        order_id,
        invoice_number,
        total_amount,
        status,
        due_date,
        notes,
        customer_name,
        customer_email,
        customer_phone,
        items
      ) VALUES (
        NEW.user_id,
        NEW.outlet_id,
        NEW.id,
        invoice_num,
        NEW.total_amount,
        'unpaid',
        due_date,
        'Facture générée automatiquement pour la commande',
        NEW.customer_name,
        NEW.customer_email,
        NEW.customer_phone,
        NEW.items
      );
    END IF;
  END IF;
  
  RETURN NEW;
END;
$function$;

-- Modifier le trigger pour les sessions fermées - agréger toutes les commandes
CREATE OR REPLACE FUNCTION public.create_invoice_for_closed_session()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  invoice_num TEXT;
  due_date DATE;
  existing_invoice_id UUID;
  all_items JSONB;
  first_order RECORD;
BEGIN
  IF (TG_OP = 'UPDATE' AND OLD.status != 'closed' AND NEW.status = 'closed') THEN
    
    SELECT id INTO existing_invoice_id
    FROM public.invoices
    WHERE session_id = NEW.id
    LIMIT 1;
    
    IF existing_invoice_id IS NULL THEN
      invoice_num := public.generate_invoice_number();
      due_date := CURRENT_DATE + INTERVAL '30 days';
      
      -- Récupérer toutes les commandes de la session et agréger les items
      SELECT 
        COALESCE(jsonb_agg(item), '[]'::jsonb) INTO all_items
      FROM (
        SELECT jsonb_array_elements(o.items) as item
        FROM public.orders o
        WHERE o.session_id = NEW.id
      ) items;
      
      -- Récupérer les infos client de la première commande
      SELECT customer_name, customer_email, customer_phone
      INTO first_order
      FROM public.orders
      WHERE session_id = NEW.id
      ORDER BY created_at
      LIMIT 1;
      
      INSERT INTO public.invoices (
        user_id,
        outlet_id,
        session_id,
        invoice_number,
        total_amount,
        status,
        due_date,
        notes,
        customer_name,
        customer_email,
        customer_phone,
        items
      ) VALUES (
        NEW.user_id,
        NEW.outlet_id,
        NEW.id,
        invoice_num,
        NEW.total_amount,
        'unpaid',
        due_date,
        CONCAT('Facture générée automatiquement pour la table ', NEW.table_number),
        COALESCE(first_order.customer_name, 'Client'),
        first_order.customer_email,
        first_order.customer_phone,
        all_items
      );
    END IF;
  END IF;
  
  RETURN NEW;
END;
$function$;