-- 1) Remove permissive SELECT policy on button_click_tracking; admin ALL policy remains
DROP POLICY IF EXISTS "Only authenticated users can view button tracking" ON public.button_click_tracking;

-- 2) Harden team_member_has_outlet_access: require accepted + member_user_id match only
CREATE OR REPLACE FUNCTION public.team_member_has_outlet_access(_owner_id uuid, _outlet_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
  SELECT EXISTS (
    SELECT 1
    FROM public.team_members tm
    WHERE tm.owner_id = _owner_id
      AND tm.is_active = true
      AND tm.status = 'accepted'
      AND tm.member_user_id IS NOT NULL
      AND tm.member_user_id = auth.uid()
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
$function$;