-- Corriger la fonction generate_outlet_access_code pour éviter les doublons
DROP FUNCTION IF EXISTS public.generate_outlet_access_code(_outlet_id uuid, _role outlet_role);

CREATE OR REPLACE FUNCTION public.generate_outlet_access_code(_outlet_id uuid, _role outlet_role)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  outlet_name TEXT;
  name_prefix TEXT;
  final_code TEXT;
  code_exists BOOLEAN;
  counter INTEGER := 0;
BEGIN
  -- Get outlet name
  SELECT name INTO outlet_name FROM public.outlets WHERE id = _outlet_id;
  
  -- Get first 3 letters of outlet name (uppercase, remove spaces)
  name_prefix := UPPER(LEFT(REPLACE(outlet_name, ' ', ''), 3));
  
  -- Si c'est le propriétaire, utiliser le code avec 1787
  IF _role = 'proprietaire' THEN
    LOOP
      -- Si c'est la première tentative, utiliser le code de base
      IF counter = 0 THEN
        final_code := 'QRX-' || name_prefix || '-1787';
      ELSE
        -- Si le code existe déjà, ajouter un suffixe
        final_code := 'QRX-' || name_prefix || '-1787-' || counter::TEXT;
      END IF;
      
      -- Check if code already exists
      SELECT EXISTS(SELECT 1 FROM public.outlet_profiles WHERE access_code = final_code) INTO code_exists;
      
      EXIT WHEN NOT code_exists;
      
      counter := counter + 1;
    END LOOP;
  ELSE
    -- Pour les autres rôles, générer un code aléatoire comme avant
    LOOP
      -- Generate 4 random alphanumeric characters
      final_code := 'QRX-' || name_prefix || '-' || UPPER(SUBSTRING(MD5(RANDOM()::TEXT || CLOCK_TIMESTAMP()::TEXT) FROM 1 FOR 4));
      
      -- Check if code already exists
      SELECT EXISTS(SELECT 1 FROM public.outlet_profiles WHERE access_code = final_code) INTO code_exists;
      
      EXIT WHEN NOT code_exists;
    END LOOP;
  END IF;
  
  RETURN final_code;
END;
$$;