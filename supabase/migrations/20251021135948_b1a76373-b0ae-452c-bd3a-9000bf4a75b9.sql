-- Create invoice_settings table for customizable invoice configuration
CREATE TABLE IF NOT EXISTS public.invoice_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  outlet_id uuid,
  
  -- Configuration fields
  invoice_title text NOT NULL DEFAULT 'FACTURE',
  company_name text,
  company_address text,
  company_phone text,
  company_email text,
  tax_id text,
  
  -- Footer configuration
  payment_terms text DEFAULT 'Paiement à effectuer sous 30 jours à compter de la date de facturation.',
  footer_note text,
  
  -- Styling
  logo_url text,
  primary_color text DEFAULT '#3B82F6',
  
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  
  CONSTRAINT invoice_settings_user_id_outlet_id_key UNIQUE(user_id, outlet_id)
);

-- Enable RLS
ALTER TABLE public.invoice_settings ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own invoice settings"
  ON public.invoice_settings
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own invoice settings"
  ON public.invoice_settings
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own invoice settings"
  ON public.invoice_settings
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own invoice settings"
  ON public.invoice_settings
  FOR DELETE
  USING (auth.uid() = user_id);

-- Trigger for updated_at
CREATE TRIGGER update_invoice_settings_updated_at
  BEFORE UPDATE ON public.invoice_settings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();