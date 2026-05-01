-- 1. Colonnes
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS restaurant_slug text;
CREATE UNIQUE INDEX IF NOT EXISTS profiles_restaurant_slug_unique ON public.profiles(restaurant_slug) WHERE restaurant_slug IS NOT NULL;

ALTER TABLE public.outlets ADD COLUMN IF NOT EXISTS slug text;
ALTER TABLE public.outlets ADD COLUMN IF NOT EXISTS whatsapp_number text;
CREATE UNIQUE INDEX IF NOT EXISTS outlets_user_slug_unique ON public.outlets(user_id, slug) WHERE slug IS NOT NULL;

-- 2. Helpers (ordre correct)
CREATE OR REPLACE FUNCTION public.unaccent_string(_input text)
RETURNS text LANGUAGE sql IMMUTABLE SET search_path = public AS $$
  SELECT translate(coalesce(_input,''),
    'àáâãäåèéêëìíîïòóôõöùúûüýÿñçÀÁÂÃÄÅÈÉÊËÌÍÎÏÒÓÔÕÖÙÚÛÜÝŸÑÇ',
    'aaaaaaeeeeiiiiooooouuuuyyncAAAAAAEEEEIIIIOOOOOUUUUYYNC');
$$;

CREATE OR REPLACE FUNCTION public.slugify(_input text)
RETURNS text LANGUAGE sql IMMUTABLE SET search_path = public AS $$
  SELECT trim(both '-' from regexp_replace(
    lower(public.unaccent_string(coalesce(_input, ''))),
    '[^a-z0-9]+', '-', 'g'));
$$;

-- 3. Backfill profiles
DO $$
DECLARE rec RECORD; base_slug text; final_slug text; counter int;
BEGIN
  FOR rec IN SELECT id, full_name, email FROM public.profiles WHERE restaurant_slug IS NULL LOOP
    base_slug := public.slugify(COALESCE(NULLIF(rec.full_name, ''), split_part(rec.email, '@', 1), 'restaurant'));
    IF base_slug = '' OR base_slug IS NULL THEN base_slug := 'restaurant'; END IF;
    final_slug := base_slug; counter := 1;
    WHILE EXISTS (SELECT 1 FROM public.profiles WHERE restaurant_slug = final_slug) LOOP
      counter := counter + 1; final_slug := base_slug || '-' || counter;
    END LOOP;
    UPDATE public.profiles SET restaurant_slug = final_slug WHERE id = rec.id;
  END LOOP;
END $$;

-- 4. Backfill outlets
DO $$
DECLARE rec RECORD; base_slug text; final_slug text; counter int;
BEGIN
  FOR rec IN SELECT id, user_id, name FROM public.outlets WHERE slug IS NULL LOOP
    base_slug := public.slugify(COALESCE(NULLIF(rec.name, ''), 'pdv'));
    IF base_slug = '' OR base_slug IS NULL THEN base_slug := 'pdv'; END IF;
    final_slug := base_slug; counter := 1;
    WHILE EXISTS (SELECT 1 FROM public.outlets WHERE user_id = rec.user_id AND slug = final_slug) LOOP
      counter := counter + 1; final_slug := base_slug || '-' || counter;
    END LOOP;
    UPDATE public.outlets SET slug = final_slug WHERE id = rec.id;
  END LOOP;
END $$;

-- 5. Trigger outlets
CREATE OR REPLACE FUNCTION public.outlets_set_slug()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE base_slug text; final_slug text; counter int := 1;
BEGIN
  IF NEW.slug IS NULL OR NEW.slug = '' THEN
    base_slug := public.slugify(COALESCE(NULLIF(NEW.name, ''), 'pdv'));
    IF base_slug = '' THEN base_slug := 'pdv'; END IF;
    final_slug := base_slug;
    WHILE EXISTS (SELECT 1 FROM public.outlets WHERE user_id = NEW.user_id AND slug = final_slug AND id <> COALESCE(NEW.id, gen_random_uuid())) LOOP
      counter := counter + 1; final_slug := base_slug || '-' || counter;
    END LOOP;
    NEW.slug := final_slug;
  END IF;
  RETURN NEW;
END; $$;

DROP TRIGGER IF EXISTS outlets_set_slug_trigger ON public.outlets;
CREATE TRIGGER outlets_set_slug_trigger BEFORE INSERT ON public.outlets
FOR EACH ROW EXECUTE FUNCTION public.outlets_set_slug();

-- 6. Trigger profiles
CREATE OR REPLACE FUNCTION public.profiles_set_restaurant_slug()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE base_slug text; final_slug text; counter int := 1;
BEGIN
  IF NEW.restaurant_slug IS NULL OR NEW.restaurant_slug = '' THEN
    base_slug := public.slugify(COALESCE(NULLIF(NEW.full_name, ''), split_part(COALESCE(NEW.email,''), '@', 1), 'restaurant'));
    IF base_slug = '' THEN base_slug := 'restaurant'; END IF;
    final_slug := base_slug;
    WHILE EXISTS (SELECT 1 FROM public.profiles WHERE restaurant_slug = final_slug AND id <> NEW.id) LOOP
      counter := counter + 1; final_slug := base_slug || '-' || counter;
    END LOOP;
    NEW.restaurant_slug := final_slug;
  END IF;
  RETURN NEW;
END; $$;

DROP TRIGGER IF EXISTS profiles_set_slug_trigger ON public.profiles;
CREATE TRIGGER profiles_set_slug_trigger BEFORE INSERT ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.profiles_set_restaurant_slug();

-- 7. Fonction publique de résolution
CREATE OR REPLACE FUNCTION public.resolve_public_menu(_restaurant_slug text, _outlet_slug text)
RETURNS TABLE(menu_id uuid, user_id uuid, outlet_id uuid, outlet_name text, whatsapp_number text, restaurant_name text)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT m.id, p.id, o.id, o.name, o.whatsapp_number, p.full_name
  FROM public.profiles p
  JOIN public.outlets o ON o.user_id = p.id
  LEFT JOIN public.menus m ON m.outlet_id = o.id AND m.is_active = true
  WHERE p.restaurant_slug = _restaurant_slug AND o.slug = _outlet_slug
  ORDER BY m.created_at DESC NULLS LAST
  LIMIT 1;
$$;

GRANT EXECUTE ON FUNCTION public.resolve_public_menu(text, text) TO anon, authenticated;