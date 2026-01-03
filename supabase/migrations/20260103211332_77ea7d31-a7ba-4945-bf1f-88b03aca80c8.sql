-- Table de liaison entre team_members et outlets (many-to-many)
CREATE TABLE public.team_member_outlets (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    team_member_id uuid NOT NULL REFERENCES public.team_members(id) ON DELETE CASCADE,
    outlet_id uuid NOT NULL REFERENCES public.outlets(id) ON DELETE CASCADE,
    created_at timestamp with time zone DEFAULT now(),
    UNIQUE(team_member_id, outlet_id)
);

-- Index pour les requêtes fréquentes
CREATE INDEX idx_team_member_outlets_member ON public.team_member_outlets(team_member_id);
CREATE INDEX idx_team_member_outlets_outlet ON public.team_member_outlets(outlet_id);

-- Activer RLS
ALTER TABLE public.team_member_outlets ENABLE ROW LEVEL SECURITY;

-- Politique: les propriétaires peuvent gérer les outlets de leurs membres
CREATE POLICY "Owners can manage team member outlets"
ON public.team_member_outlets
FOR ALL
USING (
    EXISTS (
        SELECT 1 FROM public.team_members tm
        WHERE tm.id = team_member_outlets.team_member_id
        AND tm.owner_id = auth.uid()
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.team_members tm
        WHERE tm.id = team_member_outlets.team_member_id
        AND tm.owner_id = auth.uid()
    )
);

-- Politique: les membres peuvent voir leurs propres outlets
CREATE POLICY "Members can view their own outlets"
ON public.team_member_outlets
FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM public.team_members tm
        WHERE tm.id = team_member_outlets.team_member_id
        AND (tm.member_user_id = auth.uid() OR tm.member_email = (auth.jwt()->>'email'))
    )
);

-- Migrer les données existantes (si outlet_id existe dans team_members)
INSERT INTO public.team_member_outlets (team_member_id, outlet_id)
SELECT id, outlet_id FROM public.team_members WHERE outlet_id IS NOT NULL
ON CONFLICT DO NOTHING;

-- Fonction RPC pour récupérer les outlets d'un membre (SECURITY DEFINER pour bypass RLS)
CREATE OR REPLACE FUNCTION public.get_team_member_outlets(_member_id uuid)
RETURNS TABLE(outlet_id uuid, outlet_name text)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT tmo.outlet_id, o.name as outlet_name
  FROM team_member_outlets tmo
  JOIN outlets o ON o.id = tmo.outlet_id
  WHERE tmo.team_member_id = _member_id;
$$;