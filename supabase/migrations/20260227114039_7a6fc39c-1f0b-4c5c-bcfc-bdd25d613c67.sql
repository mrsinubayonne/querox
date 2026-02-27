-- Update generate_invoice_number to use simple sequential numbering: FAC-0001, FAC-0002, etc.
CREATE OR REPLACE FUNCTION public.generate_invoice_number()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  next_num INTEGER;
  invoice_num TEXT;
BEGIN
  -- Use advisory lock to prevent concurrent generation
  PERFORM pg_advisory_xact_lock(hashtext('generate_invoice_number'));
  
  -- Get the highest invoice number across ALL invoices (simple sequential)
  SELECT COALESCE(MAX(
    CAST(
      SUBSTRING(invoice_number FROM '[0-9]+$') AS INTEGER
    )
  ), 0) + 1
  INTO next_num
  FROM invoices
  WHERE invoice_number ~ '^FAC-[0-9]+$';
  
  -- Also check old format to avoid resetting counter
  IF next_num <= 1 THEN
    SELECT COALESCE(MAX(
      CAST(
        SUBSTRING(invoice_number FROM '[0-9]+$') AS INTEGER
      )
    ), 0) + 1
    INTO next_num
    FROM invoices
    WHERE invoice_number ~ '-[0-9]+$'
      AND invoice_number NOT LIKE 'OFF-%';
  END IF;
  
  -- Format: FAC-0001, FAC-0002, etc.
  invoice_num := 'FAC-' || LPAD(next_num::TEXT, 4, '0');
  
  RETURN invoice_num;
END;
$function$;