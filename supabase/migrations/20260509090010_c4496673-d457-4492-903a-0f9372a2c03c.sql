
-- 1. Helper SECURITY DEFINER: check if a menu is publicly active
CREATE OR REPLACE FUNCTION public.is_menu_publicly_active(_menu_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.menus WHERE id = _menu_id AND is_active = true
  );
$$;

-- 2. Public RPC returning only safe menu fields (no user_id / outlet_id leak)
CREATE OR REPLACE FUNCTION public.get_public_menu_data(_menu_id uuid)
RETURNS TABLE(
  id uuid,
  name text,
  description text,
  logo_url text,
  header_image_url text
)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT m.id, m.name, m.description, m.logo_url, m.header_image_url
  FROM public.menus m
  WHERE m.id = _menu_id AND m.is_active = true;
$$;

-- 3. Drop overly broad public SELECT policy on menus
DROP POLICY IF EXISTS "Public can view active menus" ON public.menus;

-- 4. Rewrite menu_categories public SELECT to use the helper (bypasses base-table RLS)
DROP POLICY IF EXISTS "Public can view categories of active menus" ON public.menu_categories;
CREATE POLICY "Public can view categories of active menus"
ON public.menu_categories
FOR SELECT
TO anon, authenticated
USING (public.is_menu_publicly_active(menu_id));

-- 5. Rewrite menu_items public SELECT similarly
DROP POLICY IF EXISTS "Public can view available items of active menus" ON public.menu_items;
CREATE POLICY "Public can view available items of active menus"
ON public.menu_items
FOR SELECT
TO anon, authenticated
USING (
  is_available = true
  AND EXISTS (
    SELECT 1 FROM public.menu_categories mc
    WHERE mc.id = menu_items.category_id
      AND public.is_menu_publicly_active(mc.menu_id)
  )
);

-- 6. Tighten team_activity_logs INSERT: must match a team membership tied to caller
DROP POLICY IF EXISTS "System can insert activity logs" ON public.team_activity_logs;
CREATE POLICY "Team-scoped insert of activity logs"
ON public.team_activity_logs
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.team_members tm
    WHERE tm.id = team_activity_logs.team_member_id
      AND (tm.owner_id = auth.uid() OR tm.member_user_id = auth.uid())
  )
);
