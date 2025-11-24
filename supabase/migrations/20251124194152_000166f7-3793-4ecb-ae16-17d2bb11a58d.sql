-- Add access_code column to user_profiles table
ALTER TABLE public.user_profiles 
ADD COLUMN IF NOT EXISTS access_code TEXT;

-- Create unique index on access_code for the same user
CREATE UNIQUE INDEX IF NOT EXISTS user_profiles_user_access_code_unique 
ON public.user_profiles(user_id, access_code);

-- Add comment
COMMENT ON COLUMN public.user_profiles.access_code IS 'Code d''accès personnalisé pour le profil utilisateur';