CREATE OR REPLACE FUNCTION public.team_member_has_outlet_access(_owner_id uuid, _outlet_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.team_members tm
    WHERE tm.owner_id = _owner_id
      AND tm.member_user_id = auth.uid()
      AND tm.member_user_id IS NOT NULL
      AND tm.is_active = true
      AND tm.status IN ('pending', 'accepted')
      AND _outlet_id IS NOT NULL
      AND (
        EXISTS (
          SELECT 1
          FROM public.team_member_outlets tmo
          WHERE tmo.team_member_id = tm.id
            AND tmo.outlet_id = _outlet_id
        )
        OR (
          NOT EXISTS (
            SELECT 1
            FROM public.team_member_outlets tmo
            WHERE tmo.team_member_id = tm.id
          )
          AND tm.outlet_id = _outlet_id
        )
      )
  );
$$;

CREATE OR REPLACE FUNCTION public.team_member_has_any_permission(_owner_id uuid, _permission_names text[])
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  WITH current_member AS (
    SELECT tm.id, tm.role
    FROM public.team_members tm
    WHERE tm.owner_id = _owner_id
      AND tm.member_user_id = auth.uid()
      AND tm.member_user_id IS NOT NULL
      AND tm.is_active = true
      AND tm.status IN ('pending', 'accepted')
    LIMIT 1
  )
  SELECT EXISTS (
    SELECT 1
    FROM current_member cm
    JOIN public.team_member_permissions tmp ON tmp.team_member_id = cm.id
    JOIN public.permissions p ON p.id = tmp.permission_id
    WHERE p.name = ANY(_permission_names)
  )
  OR EXISTS (
    SELECT 1
    FROM current_member cm
    JOIN public.role_permissions rp ON rp.role_name = cm.role
    JOIN public.permissions p ON p.id = rp.permission_id
    WHERE p.name = ANY(_permission_names)
      AND NOT EXISTS (
        SELECT 1
        FROM public.team_member_permissions tmp
        WHERE tmp.team_member_id = cm.id
      )
  );
$$;