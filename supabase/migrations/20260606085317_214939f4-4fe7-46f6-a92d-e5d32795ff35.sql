
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS restaurant_code TEXT;

CREATE UNIQUE INDEX IF NOT EXISTS uq_profiles_restaurant_code
  ON public.profiles(restaurant_code) WHERE restaurant_code IS NOT NULL;

CREATE OR REPLACE FUNCTION public.generate_restaurant_code()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  alphabet TEXT := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  code TEXT;
  exists_already BOOLEAN;
  i INT;
BEGIN
  LOOP
    code := 'QX-';
    FOR i IN 1..5 LOOP
      code := code || substr(alphabet, 1 + floor(random() * length(alphabet))::int, 1);
    END LOOP;
    SELECT EXISTS(SELECT 1 FROM public.profiles WHERE restaurant_code = code) INTO exists_already;
    EXIT WHEN NOT exists_already;
  END LOOP;
  RETURN code;
END;
$$;

CREATE OR REPLACE FUNCTION public.profiles_assign_restaurant_code()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.restaurant_code IS NULL OR NEW.restaurant_code = '' THEN
    NEW.restaurant_code := public.generate_restaurant_code();
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_profiles_assign_restaurant_code ON public.profiles;
CREATE TRIGGER trg_profiles_assign_restaurant_code
  BEFORE INSERT ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.profiles_assign_restaurant_code();

DO $$
DECLARE r RECORD;
BEGIN
  FOR r IN SELECT id FROM public.profiles WHERE restaurant_code IS NULL LOOP
    UPDATE public.profiles SET restaurant_code = public.generate_restaurant_code() WHERE id = r.id;
  END LOOP;
END $$;

CREATE OR REPLACE FUNCTION public.resolve_owner_by_restaurant_code(_code text)
RETURNS uuid
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT id FROM public.profiles WHERE restaurant_code = upper(trim(_code)) LIMIT 1;
$$;

CREATE OR REPLACE FUNCTION public.set_team_member_pin(
  _member_id uuid,
  _pseudo text,
  _pin text
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
DECLARE
  v_owner uuid;
  v_pseudo text;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Non authentifié';
  END IF;

  SELECT owner_id INTO v_owner FROM public.team_members WHERE id = _member_id;
  IF v_owner IS NULL OR v_owner <> auth.uid() THEN
    RAISE EXCEPTION 'Membre introuvable ou non autorisé';
  END IF;

  IF _pin IS NULL OR length(_pin) < 4 OR length(_pin) > 8 THEN
    RAISE EXCEPTION 'Le PIN doit contenir entre 4 et 8 caractères';
  END IF;

  v_pseudo := lower(trim(_pseudo));
  IF v_pseudo IS NULL OR length(v_pseudo) < 2 THEN
    RAISE EXCEPTION 'Le pseudo doit contenir au moins 2 caractères';
  END IF;

  UPDATE public.team_members
  SET pseudo = v_pseudo,
      pin_code = crypt(_pin, gen_salt('bf', 10)),
      login_mode = 'pin'
  WHERE id = _member_id;

  RETURN true;
END;
$$;

DROP FUNCTION IF EXISTS public.verify_team_access_pin(uuid, text, text);

CREATE FUNCTION public.verify_team_access_pin(
  _owner_id uuid,
  _pseudo text,
  _pin text
)
RETURNS TABLE(
  member_id uuid,
  owner_id uuid,
  role text,
  status text,
  outlet_id uuid,
  full_name text,
  member_email text
)
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = public, extensions
AS $$
BEGIN
  RETURN QUERY
  SELECT tm.id, tm.owner_id, tm.role, tm.status, tm.outlet_id, tm.full_name, tm.member_email
  FROM public.team_members tm
  WHERE tm.owner_id = _owner_id
    AND tm.pseudo = lower(trim(_pseudo))
    AND tm.pin_code IS NOT NULL
    AND tm.pin_code = crypt(_pin, tm.pin_code)
    AND tm.is_active = true
    AND tm.status IN ('pending', 'accepted');
END;
$$;

GRANT EXECUTE ON FUNCTION public.set_team_member_pin(uuid, text, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.resolve_owner_by_restaurant_code(text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.verify_team_access_pin(uuid, text, text) TO anon, authenticated, service_role;
