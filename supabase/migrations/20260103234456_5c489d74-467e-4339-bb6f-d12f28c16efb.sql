-- Create table for direct team member permissions
CREATE TABLE public.team_member_permissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  team_member_id uuid NOT NULL REFERENCES public.team_members(id) ON DELETE CASCADE,
  permission_id uuid NOT NULL REFERENCES public.permissions(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(team_member_id, permission_id)
);

-- Enable RLS
ALTER TABLE public.team_member_permissions ENABLE ROW LEVEL SECURITY;

-- Policy: Team owners can manage permissions of their team members
CREATE POLICY "Team owners can manage member permissions"
ON public.team_member_permissions
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.team_members tm
    WHERE tm.id = team_member_permissions.team_member_id
    AND tm.owner_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.team_members tm
    WHERE tm.id = team_member_permissions.team_member_id
    AND tm.owner_id = auth.uid()
  )
);

-- Function to get team member permissions (direct or via role fallback)
CREATE OR REPLACE FUNCTION public.get_team_member_permissions(_member_id uuid)
RETURNS TABLE(permission_name text, category text, description text)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- First try to get direct permissions
  IF EXISTS (SELECT 1 FROM team_member_permissions WHERE team_member_id = _member_id) THEN
    RETURN QUERY
    SELECT p.name, p.category, p.description
    FROM team_member_permissions tmp
    JOIN permissions p ON p.id = tmp.permission_id
    WHERE tmp.team_member_id = _member_id;
  ELSE
    -- Fallback to role-based permissions
    RETURN QUERY
    SELECT p.name, p.category, p.description
    FROM team_members tm
    JOIN role_permissions rp ON rp.role_name = tm.role
    JOIN permissions p ON p.id = rp.permission_id
    WHERE tm.id = _member_id;
  END IF;
END;
$$;