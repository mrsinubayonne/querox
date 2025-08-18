
-- Créer une nouvelle table pour les rôles dynamiques
CREATE TABLE public.roles (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL UNIQUE,
  description text,
  permissions jsonb DEFAULT '[]'::jsonb,
  is_system_role boolean DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Insérer les rôles système existants
INSERT INTO public.roles (name, description, is_system_role) VALUES 
('admin', 'Administrateur système avec tous les droits', true),
('user', 'Utilisateur standard', true);

-- Activer RLS sur la table roles
ALTER TABLE public.roles ENABLE ROW LEVEL SECURITY;

-- Politique pour que tous les utilisateurs authentifiés puissent voir les rôles
CREATE POLICY "Everyone can view roles" ON public.roles FOR SELECT TO authenticated USING (true);

-- Politique pour que seuls les admins puissent gérer les rôles
CREATE POLICY "Admins can manage roles" ON public.roles FOR ALL TO authenticated USING (is_admin()) WITH CHECK (is_admin());

-- Modifier la table user_roles pour référencer la nouvelle table roles
ALTER TABLE public.user_roles DROP CONSTRAINT IF EXISTS user_roles_role_check;
ALTER TABLE public.user_roles ALTER COLUMN role TYPE text;
ADD CONSTRAINT user_roles_role_fkey FOREIGN KEY (role) REFERENCES public.roles(name) ON UPDATE CASCADE ON DELETE RESTRICT;

-- Mettre à jour les fonctions existantes pour utiliser text au lieu de l'enum
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role text)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  );
$function$;

-- Supprimer l'ancien enum (après avoir mis à jour les références)
DROP TYPE IF EXISTS public.user_role CASCADE;
