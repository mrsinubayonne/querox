-- Allow using special textual identifiers like 'TABLES_SETTINGS' for outlet-specific invoice settings
ALTER TABLE public.invoice_settings
  ALTER COLUMN outlet_id TYPE text USING outlet_id::text;