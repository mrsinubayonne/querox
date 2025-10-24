-- Amélioration de la table team_members avec informations complètes
ALTER TABLE public.team_members 
ADD COLUMN IF NOT EXISTS full_name TEXT,
ADD COLUMN IF NOT EXISTS phone TEXT,
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS last_login_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS actions_count INTEGER DEFAULT 0;

-- Table pour les permissions
CREATE TABLE IF NOT EXISTS public.permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  category TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Table de liaison rôles-permissions
CREATE TABLE IF NOT EXISTS public.role_permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  role_name TEXT NOT NULL,
  permission_id UUID REFERENCES public.permissions(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(role_name, permission_id)
);

-- Insérer les permissions de base
INSERT INTO public.permissions (name, description, category) VALUES
  ('manage_orders', 'Gérer les commandes', 'orders'),
  ('view_orders', 'Consulter les commandes', 'orders'),
  ('manage_reservations', 'Gérer les réservations', 'reservations'),
  ('view_reservations', 'Consulter les réservations', 'reservations'),
  ('manage_menu', 'Gérer le menu', 'menu'),
  ('view_menu', 'Consulter le menu', 'menu'),
  ('manage_inventory', 'Gérer l''inventaire', 'inventory'),
  ('view_inventory', 'Consulter l''inventaire', 'inventory'),
  ('manage_customers', 'Gérer les clients', 'customers'),
  ('view_customers', 'Consulter les clients', 'customers'),
  ('view_analytics', 'Accéder aux statistiques', 'analytics'),
  ('manage_team', 'Gérer l''équipe', 'team'),
  ('manage_settings', 'Gérer les paramètres', 'settings'),
  ('manage_invoices', 'Gérer les factures', 'invoices'),
  ('view_invoices', 'Consulter les factures', 'invoices')
ON CONFLICT (name) DO NOTHING;

-- Créer les rôles prédéfinis avec leurs permissions
DO $$
DECLARE
  manager_perms TEXT[] := ARRAY['manage_orders', 'view_orders', 'manage_reservations', 'view_reservations', 'manage_menu', 'view_menu', 'manage_inventory', 'view_inventory', 'manage_customers', 'view_customers', 'view_analytics', 'manage_invoices', 'view_invoices'];
  serveur_perms TEXT[] := ARRAY['manage_orders', 'view_orders', 'manage_reservations', 'view_reservations', 'view_menu', 'manage_customers', 'view_customers'];
  caissier_perms TEXT[] := ARRAY['manage_orders', 'view_orders', 'view_menu', 'manage_customers', 'view_customers', 'manage_invoices', 'view_invoices'];
  cuisinier_perms TEXT[] := ARRAY['view_orders', 'view_menu', 'view_inventory'];
  livreur_perms TEXT[] := ARRAY['view_orders', 'view_customers'];
  perm_name TEXT;
BEGIN
  -- Manager
  FOREACH perm_name IN ARRAY manager_perms
  LOOP
    INSERT INTO public.role_permissions (role_name, permission_id)
    SELECT 'manager', id FROM public.permissions WHERE name = perm_name
    ON CONFLICT DO NOTHING;
  END LOOP;

  -- Serveur
  FOREACH perm_name IN ARRAY serveur_perms
  LOOP
    INSERT INTO public.role_permissions (role_name, permission_id)
    SELECT 'serveur', id FROM public.permissions WHERE name = perm_name
    ON CONFLICT DO NOTHING;
  END LOOP;

  -- Caissier
  FOREACH perm_name IN ARRAY caissier_perms
  LOOP
    INSERT INTO public.role_permissions (role_name, permission_id)
    SELECT 'caissier', id FROM public.permissions WHERE name = perm_name
    ON CONFLICT DO NOTHING;
  END LOOP;

  -- Cuisinier
  FOREACH perm_name IN ARRAY cuisinier_perms
  LOOP
    INSERT INTO public.role_permissions (role_name, permission_id)
    SELECT 'cuisinier', id FROM public.permissions WHERE name = perm_name
    ON CONFLICT DO NOTHING;
  END LOOP;

  -- Livreur
  FOREACH perm_name IN ARRAY livreur_perms
  LOOP
    INSERT INTO public.role_permissions (role_name, permission_id)
    SELECT 'livreur', id FROM public.permissions WHERE name = perm_name
    ON CONFLICT DO NOTHING;
  END LOOP;
END $$;

-- Table pour tracker l'activité des membres
CREATE TABLE IF NOT EXISTS public.team_activity_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_member_id UUID REFERENCES public.team_members(id) ON DELETE CASCADE,
  action_type TEXT NOT NULL,
  action_description TEXT,
  entity_type TEXT,
  entity_id UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS sur les nouvelles tables
ALTER TABLE public.permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.role_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_activity_logs ENABLE ROW LEVEL SECURITY;

-- Policies pour permissions (lecture publique pour authenticated users)
CREATE POLICY "Authenticated users can view permissions"
ON public.permissions FOR SELECT
TO authenticated
USING (true);

-- Policies pour role_permissions (lecture publique pour authenticated users)
CREATE POLICY "Authenticated users can view role permissions"
ON public.role_permissions FOR SELECT
TO authenticated
USING (true);

-- Policies pour team_activity_logs
CREATE POLICY "Owners can view their team activity logs"
ON public.team_activity_logs FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.team_members
    WHERE team_members.id = team_activity_logs.team_member_id
    AND team_members.owner_id = auth.uid()
  )
);

CREATE POLICY "Team members can view their own activity logs"
ON public.team_activity_logs FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.team_members
    WHERE team_members.id = team_activity_logs.team_member_id
    AND team_members.member_user_id = auth.uid()
  )
);

CREATE POLICY "System can insert activity logs"
ON public.team_activity_logs FOR INSERT
TO authenticated
WITH CHECK (true);

-- Fonction pour vérifier les permissions d'un membre d'équipe
CREATE OR REPLACE FUNCTION public.check_team_member_permission(
  _member_email TEXT,
  _permission_name TEXT
)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM team_members tm
    JOIN role_permissions rp ON rp.role_name = tm.role
    JOIN permissions p ON p.id = rp.permission_id
    WHERE tm.member_email = _member_email
    AND tm.is_active = true
    AND tm.status = 'accepted'
    AND p.name = _permission_name
  );
$$;

-- Fonction pour obtenir toutes les permissions d'un rôle
CREATE OR REPLACE FUNCTION public.get_role_permissions(_role_name TEXT)
RETURNS TABLE(permission_name TEXT, permission_description TEXT, permission_category TEXT)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT p.name, p.description, p.category
  FROM role_permissions rp
  JOIN permissions p ON p.id = rp.permission_id
  WHERE rp.role_name = _role_name;
$$;