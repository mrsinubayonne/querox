
-- Create sequence starting after current max
DO $$
DECLARE
  max_num INTEGER;
BEGIN
  SELECT COALESCE(MAX(CAST(SUBSTRING(invoice_number FROM '[0-9]+$') AS INTEGER)), 0)
    INTO max_num
  FROM public.invoices
  WHERE invoice_number ~ '^FAC-[0-9]+$';

  IF NOT EXISTS (SELECT 1 FROM pg_class WHERE relname = 'invoice_number_seq' AND relkind = 'S') THEN
    EXECUTE format('CREATE SEQUENCE public.invoice_number_seq START WITH %s', max_num + 1);
  ELSE
    PERFORM setval('public.invoice_number_seq', GREATEST(max_num + 1, (SELECT last_value FROM public.invoice_number_seq)));
  END IF;
END $$;

CREATE OR REPLACE FUNCTION public.generate_invoice_number()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  next_num BIGINT;
  candidate TEXT;
BEGIN
  LOOP
    next_num := nextval('public.invoice_number_seq');
    candidate := 'FAC-' || LPAD(next_num::TEXT, 4, '0');
    -- Defensive: skip if (somehow) already used
    EXIT WHEN NOT EXISTS (SELECT 1 FROM public.invoices WHERE invoice_number = candidate);
  END LOOP;
  RETURN candidate;
END;
$function$;
