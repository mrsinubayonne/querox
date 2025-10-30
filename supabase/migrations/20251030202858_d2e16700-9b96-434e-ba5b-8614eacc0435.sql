-- Create profile_access_codes table for secure storage
CREATE TABLE IF NOT EXISTS public.profile_access_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_title TEXT NOT NULL,
  access_code TEXT NOT NULL UNIQUE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.profile_access_codes ENABLE ROW LEVEL SECURITY;

-- Admin can manage all codes
CREATE POLICY "Admins can manage access codes"
ON public.profile_access_codes
FOR ALL
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- Users can view active codes (for validation)
CREATE POLICY "Users can view active codes"
ON public.profile_access_codes
FOR SELECT
TO authenticated
USING (is_active = true);

-- Insert default access codes
INSERT INTO public.profile_access_codes (profile_title, access_code) VALUES
  ('Admin', 'QRX-27A79'),
  ('Comptable', 'QRX-C8218'),
  ('Caissier(e)', 'QRX-B2A15'),
  ('Caissier(e)', 'QRX-CAS77'),
  ('Serveur', 'QRX-B2A15'),
  ('Serveur', 'QRX-CAS77')
ON CONFLICT (access_code) DO NOTHING;

-- Create function to verify access code
CREATE OR REPLACE FUNCTION public.verify_profile_access_code(
  _profile_title TEXT,
  _access_code TEXT
)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.profile_access_codes
    WHERE profile_title = _profile_title
      AND access_code = _access_code
      AND is_active = true
  );
$$;

-- Add updated_at trigger
CREATE TRIGGER update_profile_access_codes_updated_at
BEFORE UPDATE ON public.profile_access_codes
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();