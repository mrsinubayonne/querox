-- Drop the old random invoice number function
DROP FUNCTION IF EXISTS public.generate_invoice_number();

-- Create new sequential invoice number function
CREATE OR REPLACE FUNCTION public.generate_invoice_number()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  year TEXT;
  month TEXT;
  next_num INTEGER;
  invoice_num TEXT;
BEGIN
  year := TO_CHAR(NOW(), 'YYYY');
  month := TO_CHAR(NOW(), 'MM');
  
  -- Get the highest invoice number for this month
  SELECT COALESCE(MAX(
    CAST(
      SUBSTRING(invoice_number FROM '[0-9]+$') AS INTEGER
    )
  ), 0) + 1
  INTO next_num
  FROM invoices
  WHERE invoice_number LIKE 'INV-' || year || month || '-%';
  
  -- Format with leading zeros (4 digits)
  invoice_num := 'INV-' || year || month || '-' || LPAD(next_num::TEXT, 4, '0');
  
  RETURN invoice_num;
END;
$function$;