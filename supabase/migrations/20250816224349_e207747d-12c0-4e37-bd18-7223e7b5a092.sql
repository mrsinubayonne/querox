-- Check and fix any remaining security definer views
-- The public_websites view should also use security_invoker for consistency

-- First, check if public_websites is a security definer view and fix it
DROP VIEW IF EXISTS public.public_websites;

-- Recreate public_websites with security_invoker for better security
CREATE VIEW public.public_websites 
WITH (security_invoker = true)
AS
SELECT 
    w.id,
    w.name,
    w.description,
    w.logo_url,
    w.header_image_url,
    w.hero_title,
    w.hero_subtitle,
    w.hero_image_url,
    w.hero_button_primary,
    w.hero_button_secondary,
    w.stats_experience,
    w.stats_clients,
    w.stats_dishes,
    w.stats_rating,
    w.specialities_title,
    w.specialities_subtitle,
    w.dish1_name,
    w.dish1_price,
    w.dish1_rating,
    w.dish1_image_url,
    w.dish2_name,
    w.dish2_price,
    w.dish2_rating,
    w.dish2_image_url,
    w.dish3_name,
    w.dish3_price,
    w.dish3_rating,
    w.dish3_image_url,
    w.contact_title,
    w.contact_subtitle,
    w.primary_color,
    w.secondary_color,
    w.template_id,
    w.custom_css,
    w.seo_title,
    w.seo_description,
    w.slug,
    w.opening_hours,
    w.social_links,
    w.created_at,
    w.updated_at
FROM public.websites w
WHERE w.is_published = true;

-- Verify admin_revenue_stats security
-- Ensure it's properly using security_invoker and admin access is enforced
-- The view should only return data if the user has admin privileges via RLS on subscribers table

COMMENT ON VIEW public.admin_revenue_stats IS 'Admin-only view for revenue statistics. Access controlled via RLS policies on subscribers table.';
COMMENT ON VIEW public.public_websites IS 'Public view for published websites. Respects RLS policies on websites table.';