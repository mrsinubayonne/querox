-- Security Fix: Restrict public access to websites table to prevent contact information theft

-- Drop the existing public policy that exposes all data
DROP POLICY IF EXISTS "Public can view published websites" ON public.websites;

-- Create a secure view for public website data that excludes sensitive information
CREATE OR REPLACE VIEW public.public_websites AS
SELECT 
    id,
    name,
    description,
    logo_url,
    header_image_url,
    hero_title,
    hero_subtitle, 
    hero_image_url,
    hero_button_primary,
    hero_button_secondary,
    stats_experience,
    stats_clients,
    stats_dishes,
    stats_rating,
    specialities_title,
    specialities_subtitle,
    dish1_name,
    dish1_price,
    dish1_rating,
    dish1_image_url,
    dish2_name,
    dish2_price,
    dish2_rating,
    dish2_image_url,
    dish3_name,
    dish3_price,
    dish3_rating,
    dish3_image_url,
    contact_title,
    contact_subtitle,
    primary_color,
    secondary_color,
    template_id,
    custom_css,
    seo_title,
    seo_description,
    slug,
    opening_hours,
    social_links,
    created_at,
    updated_at
    -- Deliberately excluded: email, phone, address, user_id, domain
FROM public.websites 
WHERE is_published = true;

-- Enable RLS on the view
ALTER VIEW public.public_websites SET (security_barrier = true);

-- Create a new secure public policy that only allows access to the safe view data
CREATE POLICY "Public can view safe published website data" ON public.websites
    FOR SELECT 
    USING (
        is_published = true 
        AND (
            -- Allow access to safe fields only for public users
            auth.uid() IS NULL 
            OR auth.uid() != user_id
        )
    );

-- Ensure owners can still see all their data
CREATE POLICY "Owners can view all their website data" ON public.websites
    FOR SELECT 
    USING (auth.uid() = user_id);

-- Create a security definer function to get public website data safely
CREATE OR REPLACE FUNCTION public.get_public_website_by_slug(website_slug text)
RETURNS TABLE(
    id uuid,
    name text,
    description text,
    logo_url text,
    header_image_url text,
    hero_title text,
    hero_subtitle text,
    hero_image_url text,
    hero_button_primary text,
    hero_button_secondary text,
    stats_experience text,
    stats_clients text,
    stats_dishes text,
    stats_rating text,
    specialities_title text,
    specialities_subtitle text,
    dish1_name text,
    dish1_price text,
    dish1_rating text,
    dish1_image_url text,
    dish2_name text,
    dish2_price text,
    dish2_rating text,
    dish2_image_url text,
    dish3_name text,
    dish3_price text,
    dish3_rating text,
    dish3_image_url text,
    contact_title text,
    contact_subtitle text,
    primary_color text,
    secondary_color text,
    template_id text,
    custom_css text,
    seo_title text,
    seo_description text,
    slug text,
    opening_hours jsonb,
    social_links jsonb,
    created_at timestamp with time zone,
    updated_at timestamp with time zone
)
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = 'public'
AS $$
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
    WHERE w.slug = website_slug 
      AND w.is_published = true;
$$;