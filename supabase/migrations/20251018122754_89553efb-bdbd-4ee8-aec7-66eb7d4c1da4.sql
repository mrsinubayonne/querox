-- Add access_code column to team_members table
ALTER TABLE public.team_members 
ADD COLUMN access_code text UNIQUE;

-- Create function to generate unique access code
CREATE OR REPLACE FUNCTION generate_team_access_code()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  code text;
  code_exists boolean;
BEGIN
  LOOP
    -- Generate a 6-character alphanumeric code
    code := upper(substring(md5(random()::text || clock_timestamp()::text) from 1 for 6));
    
    -- Check if code already exists
    SELECT EXISTS(SELECT 1 FROM team_members WHERE access_code = code) INTO code_exists;
    
    EXIT WHEN NOT code_exists;
  END LOOP;
  
  RETURN code;
END;
$$;

-- Create function to verify team member access
CREATE OR REPLACE FUNCTION verify_team_access(
  _email text,
  _access_code text
)
RETURNS TABLE(
  member_id uuid,
  owner_id uuid,
  role text,
  status text
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    id,
    owner_id,
    role,
    status
  FROM public.team_members
  WHERE member_email = _email
    AND access_code = _access_code
    AND status = 'accepted';
$$;