
DROP FUNCTION IF EXISTS public.get_public_menu_data(uuid);

CREATE OR REPLACE FUNCTION public.get_public_menu_data(_menu_id uuid)
RETURNS TABLE(
  id uuid,
  name text,
  description text,
  logo_url text,
  header_image_url text,
  user_id uuid,
  outlet_id uuid
)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT m.id, m.name, m.description, m.logo_url, m.header_image_url, m.user_id, m.outlet_id
  FROM public.menus m
  WHERE m.id = _menu_id AND m.is_active = true;
$$;
