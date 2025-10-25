-- Modifier la fonction generate_outlet_access_code pour le code propriétaire
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
BEGIN
  -- Get outlet name
  SELECT name INTO outlet_name FROM public.outlets WHERE id = _outlet_id;
  
  -- Get first 3 letters of outlet name (uppercase, remove spaces)
  name_prefix := UPPER(LEFT(REPLACE(outlet_name, ' ', ''), 3));
  
  -- Si c'est le propriétaire, utiliser le code fixe avec 1787
  IF _role = 'proprietaire' THEN
    final_code := 'QRX-' || name_prefix || '-1787';
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

-- Créer un trigger pour créer automatiquement le profil propriétaire lors de la création d'un outlet
CREATE OR REPLACE FUNCTION public.create_owner_profile_on_outlet()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  owner_code TEXT;
BEGIN
  -- Générer le code d'accès pour le propriétaire
  owner_code := public.generate_outlet_access_code(NEW.id, 'proprietaire'::public.outlet_role);
  
  -- Créer le profil propriétaire
  INSERT INTO public.outlet_profiles (outlet_id, role, access_code, profile_name, is_active)
  VALUES (
    NEW.id,
    'proprietaire'::public.outlet_role,
    owner_code,
    'Propriétaire',
    true
  );
  
  RETURN NEW;
END;
$$;

-- Supprimer l'ancien trigger s'il existe
DROP TRIGGER IF EXISTS on_outlet_created_profile ON public.outlets;

-- Créer le nouveau trigger
CREATE TRIGGER on_outlet_created_profile
AFTER INSERT ON public.outlets
FOR EACH ROW
EXECUTE FUNCTION public.create_owner_profile_on_outlet();