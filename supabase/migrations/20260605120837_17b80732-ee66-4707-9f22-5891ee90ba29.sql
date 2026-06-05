ALTER TABLE public.team_members
  ADD COLUMN IF NOT EXISTS pseudo TEXT,
  ADD COLUMN IF NOT EXISTS pin_code TEXT,
  ADD COLUMN IF NOT EXISTS login_mode TEXT NOT NULL DEFAULT 'email_code';

CREATE INDEX IF NOT EXISTS idx_team_members_pseudo ON public.team_members(owner_id, pseudo);

ALTER TABLE public.team_members
  DROP CONSTRAINT IF EXISTS uq_team_member_pseudo_per_owner;
ALTER TABLE public.team_members
  ADD CONSTRAINT uq_team_member_pseudo_per_owner UNIQUE (owner_id, pseudo);

CREATE OR REPLACE FUNCTION public.verify_team_access_pin(
  _owner_id uuid,
  _pseudo text,
  _pin text
)
RETURNS TABLE(
  member_id uuid,
  owner_id uuid,
  role text,
  status text,
  outlet_id uuid,
  full_name text
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT
    tm.id AS member_id,
    tm.owner_id,
    tm.role,
    tm.status,
    tm.outlet_id,
    tm.full_name
  FROM public.team_members tm
  WHERE tm.owner_id = _owner_id
    AND tm.pseudo = lower(trim(_pseudo))
    AND tm.pin_code = crypt(_pin, tm.pin_code)
    AND tm.is_active = true
    AND tm.status IN ('pending', 'accepted');
END;
$$;