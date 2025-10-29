-- Create default admin profile for all existing users who don't have one
INSERT INTO public.user_profiles (user_id, title, name, is_default)
SELECT 
  au.id,
  'Admin'::text,
  'Profil principal'::text,
  true
FROM auth.users au
WHERE NOT EXISTS (
  SELECT 1 FROM public.user_profiles up WHERE up.user_id = au.id
);