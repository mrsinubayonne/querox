-- Ajouter les colonnes pour les numéros d'entreprise (optionnels)
ALTER TABLE public.invoice_settings
ADD COLUMN IF NOT EXISTS rccm_number TEXT DEFAULT NULL,
ADD COLUMN IF NOT EXISTS nif_number TEXT DEFAULT NULL,
ADD COLUMN IF NOT EXISTS other_registration TEXT DEFAULT NULL;