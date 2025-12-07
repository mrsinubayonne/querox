-- Drop the existing constraint
ALTER TABLE public.invoices DROP CONSTRAINT IF EXISTS invoices_payment_method_check;

-- Add updated constraint with all payment methods including Multiple and Debiteur
ALTER TABLE public.invoices ADD CONSTRAINT invoices_payment_method_check 
CHECK (payment_method = ANY (ARRAY['Espèces'::text, 'Virement'::text, 'Visa/Mastercard'::text, 'Mobile Money'::text, 'Multiple'::text, 'Debiteur'::text]));

-- Also update table_sessions constraint if it exists
ALTER TABLE public.table_sessions DROP CONSTRAINT IF EXISTS table_sessions_payment_method_check;

ALTER TABLE public.table_sessions ADD CONSTRAINT table_sessions_payment_method_check 
CHECK (payment_method IS NULL OR payment_method = ANY (ARRAY['Espèces'::text, 'Virement'::text, 'Visa/Mastercard'::text, 'Mobile Money'::text, 'Multiple'::text, 'Debiteur'::text]));