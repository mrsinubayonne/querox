-- Function to verify team invitation (for anonymous users)
CREATE OR REPLACE FUNCTION public.verify_team_invitation(_token text)
RETURNS TABLE(
  id uuid,
  full_name text,
  member_email text,
  role text,
  status text,
  owner_id uuid,
  outlet_id uuid
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT id, full_name, member_email, role, status, owner_id, outlet_id
  FROM team_members
  WHERE access_code = _token
    AND is_active = true;
$$;

-- Function to accept team invitation (for anonymous users)
CREATE OR REPLACE FUNCTION public.accept_team_invitation(
  _token text,
  _email text
)
RETURNS TABLE(
  member_id uuid,
  owner_id uuid,
  member_role text,
  outlet_id uuid,
  full_name text
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_member RECORD;
BEGIN
  -- Get and update the member
  UPDATE team_members
  SET member_email = _email,
      status = 'accepted',
      accepted_at = now(),
      last_login_at = now()
  WHERE access_code = _token
    AND is_active = true
  RETURNING id, team_members.owner_id, role, team_members.outlet_id, team_members.full_name
  INTO v_member;
  
  IF NOT FOUND THEN
    RETURN;
  END IF;
  
  -- Return the member info
  RETURN QUERY SELECT 
    v_member.id,
    v_member.owner_id,
    v_member.role,
    v_member.outlet_id,
    v_member.full_name;
END;
$$;

-- Function to log team activity (for anonymous users)
CREATE OR REPLACE FUNCTION public.log_team_activity(
  _member_id uuid,
  _action_type text,
  _action_description text DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  INSERT INTO team_activity_logs (team_member_id, action_type, action_description)
  VALUES (_member_id, _action_type, _action_description);
END;
$$;

-- Function for team member login (update last_login)
CREATE OR REPLACE FUNCTION public.team_member_login(_email text, _access_code text)
RETURNS TABLE(
  member_id uuid,
  owner_id uuid,
  member_role text,
  outlet_id uuid,
  full_name text
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_member RECORD;
BEGIN
  -- Get and update the member
  UPDATE team_members
  SET last_login_at = now(),
      status = 'accepted'
  WHERE member_email = _email
    AND access_code = _access_code
    AND is_active = true
    AND status IN ('pending', 'accepted')
  RETURNING id, team_members.owner_id, role, team_members.outlet_id, team_members.full_name
  INTO v_member;
  
  IF NOT FOUND THEN
    RETURN;
  END IF;
  
  -- Return the member info
  RETURN QUERY SELECT 
    v_member.id,
    v_member.owner_id,
    v_member.role,
    v_member.outlet_id,
    v_member.full_name;
END;
$$;