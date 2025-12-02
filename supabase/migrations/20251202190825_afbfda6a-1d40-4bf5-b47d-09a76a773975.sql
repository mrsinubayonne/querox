-- Table pour les paiements partiels des débiteurs
CREATE TABLE public.debtor_payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id uuid REFERENCES public.invoices(id) ON DELETE CASCADE,
  debtor_id uuid REFERENCES public.business_customers(id) ON DELETE CASCADE,
  amount numeric NOT NULL,
  payment_date date DEFAULT CURRENT_DATE,
  payment_method text DEFAULT 'Espèces',
  notes text,
  user_id uuid NOT NULL,
  outlet_id uuid REFERENCES public.outlets(id),
  created_at timestamp with time zone DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.debtor_payments ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Users can manage their own debtor payments"
ON public.debtor_payments
FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Index pour performance
CREATE INDEX idx_debtor_payments_invoice_id ON public.debtor_payments(invoice_id);
CREATE INDEX idx_debtor_payments_debtor_id ON public.debtor_payments(debtor_id);
CREATE INDEX idx_debtor_payments_user_id ON public.debtor_payments(user_id);

-- Fonction pour vérifier si une facture B2B est entièrement payée et créer la transaction
CREATE OR REPLACE FUNCTION public.check_debtor_invoice_fully_paid()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  total_paid numeric;
  invoice_total numeric;
  invoice_record RECORD;
BEGIN
  -- Récupérer le total payé pour cette facture
  SELECT COALESCE(SUM(amount), 0) INTO total_paid
  FROM public.debtor_payments
  WHERE invoice_id = NEW.invoice_id;
  
  -- Récupérer les infos de la facture
  SELECT * INTO invoice_record
  FROM public.invoices
  WHERE id = NEW.invoice_id;
  
  invoice_total := invoice_record.total_amount;
  
  -- Si le total payé >= montant facture
  IF total_paid >= invoice_total THEN
    -- Mettre à jour le statut de la facture
    UPDATE public.invoices
    SET status = 'paid',
        paid_date = CURRENT_DATE,
        payment_method = NEW.payment_method
    WHERE id = NEW.invoice_id;
    
    -- Mettre à jour la dette du débiteur
    UPDATE public.business_customers
    SET current_debt = GREATEST(0, current_debt - invoice_total)
    WHERE id = invoice_record.business_customer_id;
    
    -- Créer la transaction comptable (maintenant que c'est payé)
    INSERT INTO public.transactions (
      user_id,
      outlet_id,
      title,
      amount,
      type,
      category,
      status,
      date,
      description,
      payment_method
    ) VALUES (
      invoice_record.user_id,
      invoice_record.outlet_id,
      CONCAT('Facture Débiteur ', invoice_record.invoice_number),
      invoice_total,
      'income',
      'facture',
      'completed',
      CURRENT_DATE,
      CONCAT('Paiement complet de la facture débiteur ', invoice_record.invoice_number),
      NEW.payment_method
    );
  END IF;
  
  RETURN NEW;
END;
$function$;

-- Trigger pour vérifier après chaque paiement
CREATE TRIGGER check_debtor_payment_complete
AFTER INSERT ON public.debtor_payments
FOR EACH ROW
EXECUTE FUNCTION public.check_debtor_invoice_fully_paid();

-- Modifier le trigger existant pour NE PAS créer de transaction pour les factures B2B non payées
CREATE OR REPLACE FUNCTION public.create_transaction_from_paid_invoice()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  existing_transaction_id UUID;
BEGIN
  -- Check if this is an UPDATE to 'paid' status
  IF (TG_OP = 'UPDATE' AND OLD.status != 'paid' AND NEW.status = 'paid') THEN
    
    -- Pour les factures B2B (débiteurs), ne pas créer de transaction ici
    -- La transaction sera créée par check_debtor_invoice_fully_paid()
    IF NEW.invoice_type = 'b2b' AND NEW.business_customer_id IS NOT NULL THEN
      RETURN NEW;
    END IF;
    
    -- Check if a transaction already exists for this invoice
    SELECT id INTO existing_transaction_id
    FROM public.transactions
    WHERE category = 'facture'
      AND title = CONCAT('Facture ', NEW.invoice_number)
      AND user_id = NEW.user_id
    LIMIT 1;
    
    -- If no transaction exists, create one with payment_method from invoice
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
        description,
        payment_method
      ) VALUES (
        NEW.user_id,
        NEW.outlet_id,
        CONCAT('Facture ', NEW.invoice_number),
        NEW.total_amount,
        'income',
        'facture',
        'completed',
        COALESCE(NEW.paid_date, CURRENT_DATE),
        CONCAT('Paiement de la facture ', NEW.invoice_number),
        COALESCE(NEW.payment_method, 'Espèces')
      );
    END IF;
  END IF;
  
  RETURN NEW;
END;
$function$;