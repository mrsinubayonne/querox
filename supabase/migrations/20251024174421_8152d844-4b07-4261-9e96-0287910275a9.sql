-- Drop the old outlet_user_roles table and recreate with new structure
DROP TABLE IF EXISTS public.outlet_user_roles CASCADE;

-- Create new outlet_profiles table
CREATE TABLE public.outlet_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  outlet_id UUID NOT NULL REFERENCES public.outlets(id) ON DELETE CASCADE,
  role public.outlet_role NOT NULL,
  access_code TEXT NOT NULL UNIQUE,
  profile_name TEXT NOT NULL,
  active_session_id TEXT,
  last_login_at TIMESTAMPTZ,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.outlet_profiles ENABLE ROW LEVEL SECURITY;

-- Create function to generate access code
CREATE OR REPLACE FUNCTION public.generate_outlet_access_code(_outlet_id UUID, _role public.outlet_role)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  outlet_name TEXT;
  name_prefix TEXT;
  random_suffix TEXT;
  final_code TEXT;
  code_exists BOOLEAN;
BEGIN
  -- Get outlet name
  SELECT name INTO outlet_name FROM public.outlets WHERE id = _outlet_id;
  
  -- Get first 3 letters of outlet name (uppercase, remove spaces)
  name_prefix := UPPER(LEFT(REPLACE(outlet_name, ' ', ''), 3));
  
  -- Generate unique code
  LOOP
    -- Generate 4 random alphanumeric characters
    random_suffix := UPPER(SUBSTRING(MD5(RANDOM()::TEXT || CLOCK_TIMESTAMP()::TEXT) FROM 1 FOR 4));
    
    -- Format: QRX-XXX-XXXX
    final_code := 'QRX-' || name_prefix || '-' || random_suffix;
    
    -- Check if code already exists
    SELECT EXISTS(SELECT 1 FROM public.outlet_profiles WHERE access_code = final_code) INTO code_exists;
    
    EXIT WHEN NOT code_exists;
  END LOOP;
  
  RETURN final_code;
END;
$$;

-- RLS Policies
CREATE POLICY "Outlet owners can view their outlet profiles"
ON public.outlet_profiles
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.outlets
    WHERE outlets.id = outlet_profiles.outlet_id
      AND outlets.user_id = auth.uid()
  )
);

CREATE POLICY "Outlet owners can manage their outlet profiles"
ON public.outlet_profiles
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.outlets
    WHERE outlets.id = outlet_profiles.outlet_id
      AND outlets.user_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.outlets
    WHERE outlets.id = outlet_profiles.outlet_id
      AND outlets.user_id = auth.uid()
  )
);

-- Trigger for updated_at
CREATE TRIGGER update_outlet_profiles_updated_at
BEFORE UPDATE ON public.outlet_profiles
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create security definer function to verify access code and manage sessions
CREATE OR REPLACE FUNCTION public.verify_outlet_access_code(_access_code TEXT, _session_id TEXT)
RETURNS TABLE(
  profile_id UUID,
  outlet_id UUID,
  role public.outlet_role,
  profile_name TEXT,
  outlet_name TEXT,
  owner_id UUID
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  profile_record RECORD;
BEGIN
  -- Get profile with access code
  SELECT 
    op.id,
    op.outlet_id,
    op.role,
    op.profile_name,
    op.active_session_id,
    o.name as outlet_name,
    o.user_id as owner_id
  INTO profile_record
  FROM public.outlet_profiles op
  JOIN public.outlets o ON o.id = op.outlet_id
  WHERE op.access_code = _access_code
    AND op.is_active = true;
  
  -- If profile not found or inactive
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Code d''accès invalide';
  END IF;
  
  -- If there's an active session on another device, invalidate it
  IF profile_record.active_session_id IS NOT NULL 
     AND profile_record.active_session_id != _session_id THEN
    -- This will be handled on the client side by checking the session
    NULL;
  END IF;
  
  -- Update session and last login
  UPDATE public.outlet_profiles
  SET 
    active_session_id = _session_id,
    last_login_at = now()
  WHERE id = profile_record.id;
  
  -- Return profile info
  RETURN QUERY
  SELECT 
    profile_record.id,
    profile_record.outlet_id,
    profile_record.role,
    profile_record.profile_name,
    profile_record.outlet_name,
    profile_record.owner_id;
END;
$$;

-- Function to logout (clear session)
CREATE OR REPLACE FUNCTION public.logout_outlet_profile(_profile_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.outlet_profiles
  SET active_session_id = NULL
  WHERE id = _profile_id;
END;
$$;