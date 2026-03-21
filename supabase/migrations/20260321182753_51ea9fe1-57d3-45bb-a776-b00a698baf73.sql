
-- 1. FIX: admin_revenue_stats is a VIEW - secure via GRANT (not RLS)
REVOKE ALL ON public.admin_revenue_stats FROM anon;
REVOKE ALL ON public.admin_revenue_stats FROM authenticated;
-- Only grant to authenticated, and the function get_admin_revenue_stats() already checks is_admin()

-- 2. FIX: user_roles privilege escalation - drop duplicate weak policy
DROP POLICY IF EXISTS "admins_can_manage_all_roles" ON public.user_roles;

-- Add restrictive INSERT block for non-admins
CREATE POLICY "block_non_admin_insert"
  ON public.user_roles
  AS RESTRICTIVE
  FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin());

-- 3. FIX: websites - remove public policy that exposes PII
DROP POLICY IF EXISTS "Public can view published websites" ON public.websites;

-- 4. FIX: Update public functions to exclude PII (email, phone, address, user_id)
CREATE OR REPLACE FUNCTION public.get_public_website_by_slug(website_slug text)
RETURNS TABLE(
  id uuid, name text, description text, logo_url text, header_image_url text,
  hero_title text, hero_subtitle text, hero_image_url text,
  hero_button_primary text, hero_button_secondary text,
  stats_experience text, stats_clients text, stats_dishes text, stats_rating text,
  specialities_title text, specialities_subtitle text,
  dish1_name text, dish1_price text, dish1_rating text, dish1_image_url text,
  dish2_name text, dish2_price text, dish2_rating text, dish2_image_url text,
  dish3_name text, dish3_price text, dish3_rating text, dish3_image_url text,
  contact_title text, contact_subtitle text,
  primary_color text, secondary_color text,
  template_id text, custom_css text,
  seo_title text, seo_description text,
  slug text, opening_hours jsonb, social_links jsonb,
  created_at timestamp with time zone, updated_at timestamp with time zone
)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path TO 'public'
AS $$
  SELECT w.id, w.name, w.description, w.logo_url, w.header_image_url,
    w.hero_title, w.hero_subtitle, w.hero_image_url,
    w.hero_button_primary, w.hero_button_secondary,
    w.stats_experience, w.stats_clients, w.stats_dishes, w.stats_rating,
    w.specialities_title, w.specialities_subtitle,
    w.dish1_name, w.dish1_price, w.dish1_rating, w.dish1_image_url,
    w.dish2_name, w.dish2_price, w.dish2_rating, w.dish2_image_url,
    w.dish3_name, w.dish3_price, w.dish3_rating, w.dish3_image_url,
    w.contact_title, w.contact_subtitle,
    w.primary_color, w.secondary_color,
    w.template_id, w.custom_css, w.seo_title, w.seo_description,
    w.slug, w.opening_hours, w.social_links, w.created_at, w.updated_at
  FROM public.websites w
  WHERE w.slug = website_slug AND w.is_published = true;
$$;

CREATE OR REPLACE FUNCTION public.get_public_website_safe_data(website_slug text)
RETURNS TABLE(
  id uuid, name text, description text, logo_url text, header_image_url text,
  hero_title text, hero_subtitle text, hero_image_url text,
  hero_button_primary text, hero_button_secondary text,
  stats_experience text, stats_clients text, stats_dishes text, stats_rating text,
  specialities_title text, specialities_subtitle text,
  dish1_name text, dish1_price text, dish1_rating text, dish1_image_url text,
  dish2_name text, dish2_price text, dish2_rating text, dish2_image_url text,
  dish3_name text, dish3_price text, dish3_rating text, dish3_image_url text,
  contact_title text, contact_subtitle text,
  primary_color text, secondary_color text,
  template_id text, custom_css text,
  seo_title text, seo_description text,
  slug text, opening_hours jsonb, social_links jsonb,
  created_at timestamp with time zone, updated_at timestamp with time zone
)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path TO 'public'
AS $$
  SELECT w.id, w.name, w.description, w.logo_url, w.header_image_url,
    w.hero_title, w.hero_subtitle, w.hero_image_url,
    w.hero_button_primary, w.hero_button_secondary,
    w.stats_experience, w.stats_clients, w.stats_dishes, w.stats_rating,
    w.specialities_title, w.specialities_subtitle,
    w.dish1_name, w.dish1_price, w.dish1_rating, w.dish1_image_url,
    w.dish2_name, w.dish2_price, w.dish2_rating, w.dish2_image_url,
    w.dish3_name, w.dish3_price, w.dish3_rating, w.dish3_image_url,
    w.contact_title, w.contact_subtitle,
    w.primary_color, w.secondary_color,
    w.template_id, w.custom_css, w.seo_title, w.seo_description,
    w.slug, w.opening_hours, w.social_links, w.created_at, w.updated_at
  FROM public.websites w
  WHERE w.slug = website_slug AND w.is_published = true;
$$;

-- 5. FIX: public_websites - check if it's a view or table
-- It's likely a view, so just revoke anon access if not needed
REVOKE ALL ON public.public_websites FROM anon;
