-- ============================================================
-- 1. EXTENSION pgcrypto pour bcrypt
-- ============================================================
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ============================================================
-- 2. HASH DES CODES D'ACCÈS EXISTANTS
-- ============================================================

-- 2a. user_access_codes : hasher accounting_code et management_code
DO $$
BEGIN
  -- On considère qu'un code est "non hashé" s'il ne commence pas par $2
  UPDATE public.user_access_codes
  SET 
    accounting_code = crypt(accounting_code, gen_salt('bf', 10))
  WHERE accounting_code IS NOT NULL 
    AND accounting_code NOT LIKE '$2%';
  
  UPDATE public.user_access_codes
  SET 
    management_code = crypt(management_code, gen_salt('bf', 10))
  WHERE management_code IS NOT NULL 
    AND management_code NOT LIKE '$2%';
END $$;

-- 2b. outlet_profiles : hasher access_code
DO $$
DECLARE
  rec RECORD;
BEGIN
  FOR rec IN 
    SELECT id, access_code 
    FROM public.outlet_profiles 
    WHERE access_code IS NOT NULL AND access_code NOT LIKE '$2%'
  LOOP
    UPDATE public.outlet_profiles
    SET access_code = crypt(rec.access_code, gen_salt('bf', 10))
    WHERE id = rec.id;
  END LOOP;
END $$;

-- 2c. team_members : hasher access_code
DO $$
DECLARE
  rec RECORD;
BEGIN
  FOR rec IN 
    SELECT id, access_code 
    FROM public.team_members 
    WHERE access_code IS NOT NULL AND access_code NOT LIKE '$2%'
  LOOP
    UPDATE public.team_members
    SET access_code = crypt(rec.access_code, gen_salt('bf', 10))
    WHERE id = rec.id;
  END LOOP;
END $$;

-- ============================================================
-- 3. FONCTIONS DE VÉRIFICATION SÉCURISÉES
-- ============================================================

-- 3a. Vérifier code admin (accounting/management)
CREATE OR REPLACE FUNCTION public.verify_user_access_code(
  _user_id uuid,
  _code text,
  _type text
)
RETURNS boolean
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  stored_hash text;
BEGIN
  IF _type = 'accounting' THEN
    SELECT accounting_code INTO stored_hash
    FROM public.user_access_codes
    WHERE user_id = _user_id;
  ELSIF _type = 'management' THEN
    SELECT management_code INTO stored_hash
    FROM public.user_access_codes
    WHERE user_id = _user_id;
  ELSE
    RETURN false;
  END IF;

  IF stored_hash IS NULL THEN
    RETURN false;
  END IF;

  RETURN stored_hash = crypt(_code, stored_hash);
END;
$$;

-- 3b. Mettre à jour les codes admin (avec hash)
CREATE OR REPLACE FUNCTION public.update_user_access_codes(
  _accounting_code text,
  _management_code text
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id uuid;
BEGIN
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Non authentifié';
  END IF;

  INSERT INTO public.user_access_codes (user_id, accounting_code, management_code)
  VALUES (
    v_user_id,
    crypt(_accounting_code, gen_salt('bf', 10)),
    crypt(_management_code, gen_salt('bf', 10))
  )
  ON CONFLICT (user_id) DO UPDATE
  SET 
    accounting_code = crypt(_accounting_code, gen_salt('bf', 10)),
    management_code = crypt(_management_code, gen_salt('bf', 10)),
    last_modified_at = now();

  RETURN true;
END;
$$;

-- 3c. Mettre à jour la fonction verify_outlet_access_code pour utiliser bcrypt
CREATE OR REPLACE FUNCTION public.verify_outlet_access_code(_access_code text, _session_id text)
RETURNS TABLE(profile_id uuid, outlet_id uuid, role outlet_role, profile_name text, outlet_name text, owner_id uuid)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  profile_record RECORD;
BEGIN
  -- Recherche par comparaison bcrypt sur tous les profils actifs
  SELECT 
    op.id,
    op.outlet_id,
    op.role,
    op.profile_name,
    o.name as outlet_name,
    o.user_id as owner_id
  INTO profile_record
  FROM public.outlet_profiles op
  JOIN public.outlets o ON o.id = op.outlet_id
  WHERE op.is_active = true
    AND op.access_code = crypt(_access_code, op.access_code)
  LIMIT 1;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Code d''accès invalide';
  END IF;
  
  UPDATE public.outlet_profiles
  SET 
    active_session_id = _session_id,
    last_login_at = now()
  WHERE id = profile_record.id;
  
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

-- 3d. Mettre à jour verify_team_access pour bcrypt
CREATE OR REPLACE FUNCTION public.verify_team_access(_email text, _access_code text)
RETURNS TABLE(member_id uuid, owner_id uuid, role text, status text, outlet_id uuid)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    tm.id AS member_id,
    tm.owner_id,
    tm.role,
    tm.status,
    tm.outlet_id
  FROM public.team_members tm
  WHERE tm.member_email = _email
    AND tm.is_active = true
    AND tm.status IN ('pending', 'accepted')
    AND tm.access_code = crypt(_access_code, tm.access_code);
END;
$$;

-- 3e. team_member_login avec bcrypt
CREATE OR REPLACE FUNCTION public.team_member_login(_email text, _access_code text)
RETURNS TABLE(member_id uuid, owner_id uuid, member_role text, outlet_id uuid, full_name text)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_member RECORD;
BEGIN
  SELECT id, tm.owner_id, role, tm.outlet_id, tm.full_name
  INTO v_member
  FROM team_members tm
  WHERE member_email = _email
    AND is_active = true
    AND status IN ('pending', 'accepted')
    AND access_code = crypt(_access_code, access_code)
  LIMIT 1;

  IF NOT FOUND THEN
    RETURN;
  END IF;

  UPDATE team_members
  SET last_login_at = now(),
      status = 'accepted'
  WHERE id = v_member.id;

  RETURN QUERY SELECT 
    v_member.id,
    v_member.owner_id,
    v_member.role,
    v_member.outlet_id,
    v_member.full_name;
END;
$$;

-- 3f. verify_team_invitation avec bcrypt
CREATE OR REPLACE FUNCTION public.verify_team_invitation(_token text)
RETURNS TABLE(id uuid, full_name text, member_email text, role text, status text, owner_id uuid, outlet_id uuid)
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT tm.id, tm.full_name, tm.member_email, tm.role, tm.status, tm.owner_id, tm.outlet_id
  FROM team_members tm
  WHERE tm.is_active = true
    AND tm.access_code = crypt(_token, tm.access_code);
END;
$$;

-- 3g. accept_team_invitation avec bcrypt
CREATE OR REPLACE FUNCTION public.accept_team_invitation(_token text, _email text)
RETURNS TABLE(member_id uuid, owner_id uuid, member_role text, outlet_id uuid, full_name text)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_member RECORD;
BEGIN
  SELECT id, tm.owner_id, role, tm.outlet_id, tm.full_name
  INTO v_member
  FROM team_members tm
  WHERE is_active = true
    AND access_code = crypt(_token, access_code)
  LIMIT 1;

  IF NOT FOUND THEN
    RETURN;
  END IF;

  UPDATE team_members
  SET member_email = _email,
      status = 'accepted',
      accepted_at = now(),
      last_login_at = now()
  WHERE id = v_member.id;

  RETURN QUERY SELECT 
    v_member.id,
    v_member.owner_id,
    v_member.role,
    v_member.outlet_id,
    v_member.full_name;
END;
$$;

-- ============================================================
-- 4. RESTREINDRE subscribers AU RÔLE authenticated
-- ============================================================
DO $$
DECLARE
  pol RECORD;
BEGIN
  FOR pol IN 
    SELECT policyname FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'subscribers'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.subscribers', pol.policyname);
  END LOOP;
END $$;

ALTER TABLE public.subscribers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own subscription"
ON public.subscribers FOR SELECT
TO authenticated
USING (user_id = auth.uid() OR public.is_admin());

CREATE POLICY "Service role can insert subscriptions"
ON public.subscribers FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid() OR public.is_admin());

CREATE POLICY "Users can update their own subscription"
ON public.subscribers FOR UPDATE
TO authenticated
USING (user_id = auth.uid() OR public.is_admin())
WITH CHECK (user_id = auth.uid() OR public.is_admin());

CREATE POLICY "Admins can delete subscriptions"
ON public.subscribers FOR DELETE
TO authenticated
USING (public.is_admin());

-- ============================================================
-- 5. POLITIQUES STORAGE BUCKET images SCOPÉES
-- ============================================================
DO $$
DECLARE
  pol RECORD;
BEGIN
  FOR pol IN 
    SELECT policyname FROM pg_policies 
    WHERE schemaname = 'storage' AND tablename = 'objects'
      AND policyname ILIKE '%images%'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON storage.objects', pol.policyname);
  END LOOP;
END $$;

CREATE POLICY "Public can view images"
ON storage.objects FOR SELECT
USING (bucket_id = 'images');

CREATE POLICY "Users can upload to their own folder"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'images' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can update their own images"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'images' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete their own images"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'images' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- ============================================================
-- 6. DURCIR user_roles (anti-élévation de privilèges)
-- ============================================================
DO $$
DECLARE
  pol RECORD;
BEGIN
  FOR pol IN 
    SELECT policyname FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'user_roles'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.user_roles', pol.policyname);
  END LOOP;
END $$;

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own roles"
ON public.user_roles FOR SELECT
TO authenticated
USING (user_id = auth.uid() OR public.is_admin());

CREATE POLICY "Only admins can assign roles"
ON public.user_roles FOR INSERT
TO authenticated
WITH CHECK (public.is_admin());

CREATE POLICY "Only admins can update roles"
ON public.user_roles FOR UPDATE
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

CREATE POLICY "Only admins can delete roles"
ON public.user_roles FOR DELETE
TO authenticated
USING (public.is_admin());

-- ============================================================
-- 7. DURCIR accounting_entries (auth requise)
-- ============================================================
DO $$
DECLARE
  pol RECORD;
BEGIN
  FOR pol IN 
    SELECT policyname FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'accounting_entries'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.accounting_entries', pol.policyname);
  END LOOP;
END $$;

ALTER TABLE public.accounting_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view accounting entries"
ON public.accounting_entries FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can insert accounting entries"
ON public.accounting_entries FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Authenticated users can update accounting entries"
ON public.accounting_entries FOR UPDATE
TO authenticated
USING (true);

CREATE POLICY "Admins can delete accounting entries"
ON public.accounting_entries FOR DELETE
TO authenticated
USING (public.is_admin());

-- ============================================================
-- 8. DURCIR stock_movements (auth requise)
-- ============================================================
DO $$
DECLARE
  pol RECORD;
BEGIN
  FOR pol IN 
    SELECT policyname FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'stock_movements'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.stock_movements', pol.policyname);
  END LOOP;
END $$;

ALTER TABLE public.stock_movements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view stock movements"
ON public.stock_movements FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.inventory_items ii
    WHERE ii.id = stock_movements.item_id
      AND ii.user_id = auth.uid()
  ) OR public.is_admin()
);

CREATE POLICY "Authenticated users can insert stock movements"
ON public.stock_movements FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.inventory_items ii
    WHERE ii.id = stock_movements.item_id
      AND ii.user_id = auth.uid()
  ) OR public.is_admin()
);