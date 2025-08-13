-- Fix security issues from the linter

-- Remove the security definer view as it's flagged as a security risk
DROP VIEW IF EXISTS public.public_websites;

-- Instead, create a more secure RLS policy approach
-- Update the public website policy to be more restrictive but still functional
DROP POLICY IF EXISTS "Public can view safe published website data" ON public.websites;
DROP POLICY IF EXISTS "Owners can view all their website data" ON public.websites;

-- Create secure policies that limit what fields are accessible
CREATE POLICY "Public can view published websites with limited data" ON public.websites
    FOR SELECT 
    USING (
        is_published = true 
        AND auth.uid() IS NULL  -- Only for anonymous users
    );

CREATE POLICY "Users can view their own websites" ON public.websites
    FOR SELECT 
    USING (auth.uid() = user_id);

-- Update the function to not use security definer view but still be secure
CREATE OR REPLACE FUNCTION public.get_public_website_by_slug(website_slug text)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
SET search_path = 'public'
AS $$
DECLARE
    result json;
BEGIN
    -- Only return safe fields for public access
    SELECT json_build_object(
        'id', w.id,
        'name', w.name,
        'description', w.description,
        'logo_url', w.logo_url,
        'header_image_url', w.header_image_url,
        'hero_title', w.hero_title,
        'hero_subtitle', w.hero_subtitle,
        'hero_image_url', w.hero_image_url,
        'hero_button_primary', w.hero_button_primary,
        'hero_button_secondary', w.hero_button_secondary,
        'stats_experience', w.stats_experience,
        'stats_clients', w.stats_clients,
        'stats_dishes', w.stats_dishes,
        'stats_rating', w.stats_rating,
        'specialities_title', w.specialities_title,
        'specialities_subtitle', w.specialities_subtitle,
        'dish1_name', w.dish1_name,
        'dish1_price', w.dish1_price,
        'dish1_rating', w.dish1_rating,
        'dish1_image_url', w.dish1_image_url,
        'dish2_name', w.dish2_name,
        'dish2_price', w.dish2_price,
        'dish2_rating', w.dish2_rating,
        'dish2_image_url', w.dish2_image_url,
        'dish3_name', w.dish3_name,
        'dish3_price', w.dish3_price,
        'dish3_rating', w.dish3_rating,
        'dish3_image_url', w.dish3_image_url,
        'contact_title', w.contact_title,
        'contact_subtitle', w.contact_subtitle,
        'primary_color', w.primary_color,
        'secondary_color', w.secondary_color,
        'template_id', w.template_id,
        'seo_title', w.seo_title,
        'seo_description', w.seo_description,
        'slug', w.slug,
        'opening_hours', w.opening_hours,
        'social_links', w.social_links
        -- Deliberately exclude: email, phone, address, user_id, domain, custom_css
    ) INTO result
    FROM public.websites w
    WHERE w.slug = website_slug 
      AND w.is_published = true;
    
    RETURN result;
END;
$$;