-- Fix 1: Set search_path on cleanup_rate_limits function
CREATE OR REPLACE FUNCTION public.cleanup_rate_limits()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    DELETE FROM public.api_rate_limits
    WHERE window_start < now() - INTERVAL '1 hour';
END;
$$;

-- Fix 2: Enable RLS on api_rate_limits
ALTER TABLE public.api_rate_limits ENABLE ROW LEVEL SECURITY;

-- Allow service role / admin to manage rate limits
CREATE POLICY "Service role can manage rate limits"
ON public.api_rate_limits
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);