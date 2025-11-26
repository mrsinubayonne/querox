-- Add payment_method column to invoices table
ALTER TABLE public.invoices 
ADD COLUMN IF NOT EXISTS payment_method TEXT DEFAULT 'Espèces' CHECK (payment_method IN ('Espèces', 'Virement', 'Visa/Mastercard', 'Mobile Money'));

-- Add payment_method column to transactions table for consistency
ALTER TABLE public.transactions
ADD COLUMN IF NOT EXISTS payment_method TEXT DEFAULT 'Espèces' CHECK (payment_method IN ('Espèces', 'Virement', 'Visa/Mastercard', 'Mobile Money'));