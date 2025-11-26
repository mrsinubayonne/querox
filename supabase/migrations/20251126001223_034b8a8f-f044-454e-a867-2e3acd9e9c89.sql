-- Ajouter le champ debtor_id à table_sessions pour lier aux débiteurs
ALTER TABLE public.table_sessions
ADD COLUMN IF NOT EXISTS debtor_id UUID REFERENCES public.business_customers(id) ON DELETE SET NULL;

-- Créer un index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_table_sessions_debtor_id ON public.table_sessions(debtor_id);

-- Modifier le trigger de création automatique de facture pour gérer les débiteurs
CREATE OR REPLACE FUNCTION public.create_invoice_for_closed_session()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
DECLARE
  invoice_num TEXT;
  due_date DATE;
  existing_invoice_id UUID;
  all_items JSONB;
  first_order RECORD;
  debtor_payment_terms INTEGER;
BEGIN
  IF (TG_OP = 'UPDATE' AND OLD.status != 'closed' AND NEW.status = 'closed') THEN
    
    SELECT id INTO existing_invoice_id
    FROM public.invoices
    WHERE session_id = NEW.id
    LIMIT 1;
    
    IF existing_invoice_id IS NULL THEN
      invoice_num := public.generate_invoice_number();
      
      -- Si un débiteur est lié, utiliser ses conditions de paiement
      IF NEW.debtor_id IS NOT NULL THEN
        SELECT payment_terms_days INTO debtor_payment_terms
        FROM public.business_customers
        WHERE id = NEW.debtor_id;
        
        due_date := CURRENT_DATE + INTERVAL '1 day' * COALESCE(debtor_payment_terms, 30);
      ELSE
        due_date := CURRENT_DATE + INTERVAL '30 days';
      END IF;
      
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
        business_customer_id,
        invoice_number,
        invoice_type,
        total_amount,
        status,
        due_date,
        payment_terms_days,
        notes,
        customer_name,
        customer_email,
        customer_phone,
        items
      ) VALUES (
        NEW.user_id,
        NEW.outlet_id,
        NEW.id,
        NEW.debtor_id,
        invoice_num,
        CASE WHEN NEW.debtor_id IS NOT NULL THEN 'b2b' ELSE 'b2c' END,
        NEW.total_amount,
        'unpaid',
        due_date,
        debtor_payment_terms,
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