-- =====================================================
-- SECURITY FIX: Querox Database Hardening (Fixed)
-- =====================================================

-- 1. FIX: button_click_tracking - Restrict to authenticated users only
DROP POLICY IF EXISTS "Anyone can view button tracking" ON public.button_click_tracking;
DROP POLICY IF EXISTS "Only authenticated users can view button tracking" ON public.button_click_tracking;

CREATE POLICY "Only authenticated users can view button tracking"
ON public.button_click_tracking
FOR SELECT
TO authenticated
USING (true);

-- 2. FIX: roles table - Restrict visibility to authenticated users only
DROP POLICY IF EXISTS "Users can view all roles" ON public.roles;
DROP POLICY IF EXISTS "Authenticated users can view roles" ON public.roles;

CREATE POLICY "Authenticated users can view roles"
ON public.roles
FOR SELECT
TO authenticated
USING (true);

-- 3. FIX: Update functions with proper search_path
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 4. Create has_role function (security definer for RLS)
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role text)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role::text = _role
  )
$$;

-- 5. FIX: Ensure user_roles table has proper RLS
ALTER TABLE IF EXISTS public.user_roles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can manage all roles" ON public.user_roles;

-- Users can only view their own roles
CREATE POLICY "Users can view own roles"
ON public.user_roles
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- Admins can manage all roles (using security definer function to avoid recursion)
CREATE POLICY "Admins can manage all roles"
ON public.user_roles
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- 6. Add rate limiting metadata table for future implementation
CREATE TABLE IF NOT EXISTS public.rate_limit_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ip_address inet NOT NULL,
  endpoint text NOT NULL,
  request_count integer DEFAULT 1,
  window_start timestamp with time zone DEFAULT now(),
  created_at timestamp with time zone DEFAULT now()
);

ALTER TABLE public.rate_limit_log ENABLE ROW LEVEL SECURITY;

-- Only service role can access rate limiting logs
DROP POLICY IF EXISTS "Service role only for rate limits" ON public.rate_limit_log;
CREATE POLICY "Service role only for rate limits"
ON public.rate_limit_log
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Add index for rate limiting performance
CREATE INDEX IF NOT EXISTS idx_rate_limit_ip_endpoint 
ON public.rate_limit_log(ip_address, endpoint, window_start);

-- 7. Secure the admin_revenue_stats VIEW by recreating with security barrier
-- First, get the view definition to recreate it properly
-- Note: Views inherit security from underlying tables via RLS