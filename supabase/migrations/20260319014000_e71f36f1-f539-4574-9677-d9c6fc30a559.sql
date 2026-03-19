
-- 1. Purge old table sessions (older than 24h, status active/closed)
UPDATE public.table_sessions 
SET status = 'paid', 
    closed_at = COALESCE(closed_at, now()),
    payment_method = COALESCE(payment_method, 'Espèces')
WHERE status IN ('active', 'closed') 
  AND created_at < now() - INTERVAL '24 hours';

-- 2. Create auto-cleanup function for stale sessions
CREATE OR REPLACE FUNCTION public.cleanup_stale_table_sessions()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  UPDATE public.table_sessions 
  SET status = 'paid', 
      closed_at = COALESCE(closed_at, now()),
      payment_method = COALESCE(payment_method, 'Espèces')
  WHERE status IN ('active', 'closed') 
    AND created_at < now() - INTERVAL '12 hours';
END;
$$;

-- 3. SECURITY FIX: Remove universal backdoor code from verify_outlet_access_code
CREATE OR REPLACE FUNCTION public.verify_outlet_access_code(_access_code text, _session_id text)
 RETURNS TABLE(profile_id uuid, outlet_id uuid, role outlet_role, profile_name text, outlet_name text, owner_id uuid)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $$
DECLARE
  profile_record RECORD;
BEGIN
  -- Normal code lookup only - no universal backdoor
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
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Code d''accès invalide';
  END IF;
  
  -- Update session and last login
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

-- 4. Clean duplicate RLS policies on menu_categories
DROP POLICY IF EXISTS "Users can create menu categories" ON public.menu_categories;
DROP POLICY IF EXISTS "Users can delete menu categories" ON public.menu_categories;
DROP POLICY IF EXISTS "Users can delete their menu categories" ON public.menu_categories;
DROP POLICY IF EXISTS "Users can insert categories for their own menus" ON public.menu_categories;
DROP POLICY IF EXISTS "Users can insert menu categories" ON public.menu_categories;
DROP POLICY IF EXISTS "Users can update categories of their own menus" ON public.menu_categories;
DROP POLICY IF EXISTS "Users can update menu categories" ON public.menu_categories;
DROP POLICY IF EXISTS "Users can update their menu categories" ON public.menu_categories;
DROP POLICY IF EXISTS "Users can view categories of their own menus" ON public.menu_categories;
DROP POLICY IF EXISTS "Users can view menu categories" ON public.menu_categories;
DROP POLICY IF EXISTS "Users can view their menu categories" ON public.menu_categories;
-- Keep: "Authenticated users can manage their own menu categories" (ALL)
-- Keep: "Owners can manage categories of own menus" (ALL)
-- Keep: "Public can view categories of active menus" (SELECT)

-- 5. Clean duplicate RLS policies on menu_items
DROP POLICY IF EXISTS "Users can create menu items" ON public.menu_items;
DROP POLICY IF EXISTS "Users can delete items of their own menu categories" ON public.menu_items;
DROP POLICY IF EXISTS "Users can delete menu items" ON public.menu_items;
DROP POLICY IF EXISTS "Users can delete their menu items" ON public.menu_items;
DROP POLICY IF EXISTS "Users can insert items for their own menu categories" ON public.menu_items;
DROP POLICY IF EXISTS "Users can insert menu items" ON public.menu_items;
DROP POLICY IF EXISTS "Users can update items of their own menu categories" ON public.menu_items;
DROP POLICY IF EXISTS "Users can update menu items" ON public.menu_items;
DROP POLICY IF EXISTS "Users can update their menu items" ON public.menu_items;
DROP POLICY IF EXISTS "Users can view items of their own menu categories" ON public.menu_items;
DROP POLICY IF EXISTS "Users can view menu items" ON public.menu_items;
DROP POLICY IF EXISTS "Users can view their menu items" ON public.menu_items;
-- Keep: "Authenticated users can manage their own menu items" (ALL)
-- Keep: "Owners can manage items in own menus" (ALL)
-- Keep: "Public can view available items of active menus" (SELECT)

-- 6. Create storage bucket for images
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'images', 
  'images', 
  true, 
  5242880, -- 5MB
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
) ON CONFLICT (id) DO NOTHING;

-- Storage RLS: authenticated users can upload
CREATE POLICY "Authenticated users can upload images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'images');

-- Storage RLS: anyone can view images  
CREATE POLICY "Public can view images"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'images');

-- Storage RLS: users can delete their own uploads
CREATE POLICY "Users can delete own images"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'images' AND (auth.uid()::text = (storage.foldername(name))[1]));
