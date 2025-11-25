-- Create business_customers table for B2B clients
CREATE TABLE IF NOT EXISTS public.business_customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  outlet_id UUID REFERENCES public.outlets(id) ON DELETE SET NULL,
  company_name TEXT NOT NULL,
  siret TEXT,
  address TEXT,
  contact_person TEXT,
  email TEXT,
  phone TEXT,
  credit_limit NUMERIC DEFAULT 0,
  current_debt NUMERIC DEFAULT 0,
  payment_terms_days INTEGER NOT NULL DEFAULT 30,
  is_active BOOLEAN NOT NULL DEFAULT true,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Add RLS policies for business_customers
ALTER TABLE public.business_customers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own business customers"
ON public.business_customers
FOR ALL
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Add columns to invoices table for B2B support
ALTER TABLE public.invoices
ADD COLUMN IF NOT EXISTS invoice_type TEXT NOT NULL DEFAULT 'b2c',
ADD COLUMN IF NOT EXISTS business_customer_id UUID REFERENCES public.business_customers(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS payment_terms_days INTEGER,
ADD COLUMN IF NOT EXISTS siret TEXT,
ADD COLUMN IF NOT EXISTS billing_address TEXT;

-- Add constraint to check invoice_type
ALTER TABLE public.invoices
DROP CONSTRAINT IF EXISTS invoices_type_check;

ALTER TABLE public.invoices
ADD CONSTRAINT invoices_type_check CHECK (invoice_type IN ('b2c', 'b2b'));

-- Create trigger to update business_customers updated_at
CREATE OR REPLACE FUNCTION public.update_business_customers_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_business_customers_updated_at
BEFORE UPDATE ON public.business_customers
FOR EACH ROW
EXECUTE FUNCTION public.update_business_customers_updated_at();

-- Create trigger to update current_debt when invoices are created/updated
CREATE OR REPLACE FUNCTION public.update_business_customer_debt()
RETURNS TRIGGER AS $$
BEGIN
  -- When B2B invoice is created as unpaid
  IF (TG_OP = 'INSERT' AND NEW.invoice_type = 'b2b' AND NEW.business_customer_id IS NOT NULL AND NEW.status = 'unpaid') THEN
    UPDATE public.business_customers
    SET current_debt = current_debt + NEW.total_amount
    WHERE id = NEW.business_customer_id;
  END IF;
  
  -- When B2B invoice is paid
  IF (TG_OP = 'UPDATE' AND OLD.status = 'unpaid' AND NEW.status = 'paid' AND NEW.invoice_type = 'b2b' AND NEW.business_customer_id IS NOT NULL) THEN
    UPDATE public.business_customers
    SET current_debt = GREATEST(0, current_debt - NEW.total_amount)
    WHERE id = NEW.business_customer_id;
  END IF;
  
  -- When B2B invoice is deleted
  IF (TG_OP = 'DELETE' AND OLD.invoice_type = 'b2b' AND OLD.business_customer_id IS NOT NULL AND OLD.status = 'unpaid') THEN
    UPDATE public.business_customers
    SET current_debt = GREATEST(0, current_debt - OLD.total_amount)
    WHERE id = OLD.business_customer_id;
    RETURN OLD;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER update_business_customer_debt_trigger
AFTER INSERT OR UPDATE OR DELETE ON public.invoices
FOR EACH ROW
EXECUTE FUNCTION public.update_business_customer_debt();

-- Create view for overdue invoices
CREATE OR REPLACE VIEW public.overdue_invoices AS
SELECT 
  i.*,
  bc.company_name,
  bc.contact_person,
  bc.email as customer_email_b2b,
  CASE 
    WHEN i.due_date IS NOT NULL THEN CURRENT_DATE - i.due_date
    ELSE 0
  END as days_overdue
FROM public.invoices i
LEFT JOIN public.business_customers bc ON bc.id = i.business_customer_id
WHERE i.status = 'unpaid'
  AND i.due_date < CURRENT_DATE
ORDER BY i.due_date ASC;

-- Grant access to the view
GRANT SELECT ON public.overdue_invoices TO authenticated;

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_invoices_business_customer ON public.invoices(business_customer_id) WHERE invoice_type = 'b2b';
CREATE INDEX IF NOT EXISTS idx_invoices_overdue ON public.invoices(due_date, status) WHERE status = 'unpaid';