-- Table pour stocker les codes d'accès de sécurité par utilisateur
CREATE TABLE IF NOT EXISTS public.user_access_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  accounting_code TEXT NOT NULL DEFAULT 'QRX-C8218',
  management_code TEXT NOT NULL DEFAULT 'QRX-27A79',
  last_modified_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id)
);

-- Enable RLS
ALTER TABLE public.user_access_codes ENABLE ROW LEVEL SECURITY;

-- Users can view their own codes
CREATE POLICY "Users can view their own access codes"
ON public.user_access_codes
FOR SELECT
USING (auth.uid() = user_id);

-- Users can update their own codes
CREATE POLICY "Users can update their own access codes"
ON public.user_access_codes
FOR UPDATE
USING (auth.uid() = user_id);

-- Users can insert their own codes
CREATE POLICY "Users can insert their own access codes"
ON public.user_access_codes
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Admins can view all codes
CREATE POLICY "Admins can view all access codes"
ON public.user_access_codes
FOR SELECT
USING (public.is_admin());

-- Trigger pour mettre à jour last_modified_at
CREATE OR REPLACE FUNCTION update_access_codes_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.last_modified_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_user_access_codes_timestamp
BEFORE UPDATE ON public.user_access_codes
FOR EACH ROW
EXECUTE FUNCTION update_access_codes_timestamp();

-- Supprimer le trigger qui crée automatiquement des transactions pour les factures payées
-- car cela cause des doublons avec les commandes
DROP TRIGGER IF EXISTS create_transaction_from_paid_invoice_trigger ON public.invoices;