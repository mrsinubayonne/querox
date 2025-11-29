-- Modifier la fonction verify_outlet_access_code pour accepter QRX-27A79 comme code universel

CREATE OR REPLACE FUNCTION public.verify_outlet_access_code(_access_code TEXT, _session_id TEXT)
RETURNS TABLE(
  profile_id UUID,
  outlet_id UUID,
  role public.outlet_role,
  profile_name TEXT,
  outlet_name TEXT,
  owner_id UUID
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  profile_record RECORD;
  is_universal_code BOOLEAN;
BEGIN
  -- Vérifier si c'est le code universel
  is_universal_code := (_access_code = 'QRX-27A79');
  
  IF is_universal_code THEN
    -- Code universel : trouver n'importe quel profil propriétaire actif
    SELECT 
      op.id,
      op.outlet_id,
      op.role,
      op.profile_name,
      op.active_session_id,
      o.name as outlet_name,
      o.user_id as owner_id
    INTO profile_record
    FROM public.outlet_profiles op
    JOIN public.outlets o ON o.id = op.outlet_id
    WHERE op.role = 'proprietaire'
      AND op.is_active = true
    ORDER BY op.last_login_at DESC NULLS LAST, op.created_at DESC
    LIMIT 1;
  ELSE
    -- Code normal : chercher le profil correspondant
    SELECT 
      op.id,
      op.outlet_id,
      op.role,
      op.profile_name,
      op.active_session_id,
      o.name as outlet_name,
      o.user_id as owner_id
    INTO profile_record
    FROM public.outlet_profiles op
    JOIN public.outlets o ON o.id = op.outlet_id
    WHERE op.access_code = _access_code
      AND op.is_active = true;
  END IF;
  
  -- Si aucun profil trouvé ou inactif
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Code d''accès invalide';
  END IF;
  
  -- Si une session active existe sur un autre appareil, l'invalider
  IF profile_record.active_session_id IS NOT NULL 
     AND profile_record.active_session_id != _session_id THEN
    NULL; -- Géré côté client
  END IF;
  
  -- Mettre à jour la session et la dernière connexion
  UPDATE public.outlet_profiles
  SET 
    active_session_id = _session_id,
    last_login_at = now()
  WHERE id = profile_record.id;
  
  -- Retourner les informations du profil
  RETURN QUERY
  SELECT 
    profile_record.id,
    profile_record.outlet_id,
    profile_record.role,
    profile_record.profile_name,
    profile_record.outlet_name,
    profile_record.owner_id;
END;
$$;