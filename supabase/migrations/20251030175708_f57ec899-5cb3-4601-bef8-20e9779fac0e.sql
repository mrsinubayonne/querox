-- Supprimer le trigger obsolète qui cause l'erreur
DROP TRIGGER IF EXISTS create_owner_role_trigger ON public.outlets;

-- Supprimer les fonctions obsolètes qui référencent outlet_user_roles
DROP FUNCTION IF EXISTS public.create_owner_outlet_role() CASCADE;
DROP FUNCTION IF EXISTS public.has_outlet_role(uuid, uuid, outlet_role) CASCADE;
DROP FUNCTION IF EXISTS public.get_user_outlet_role(uuid, uuid) CASCADE;