
-- Indexes (IF NOT EXISTS handles idempotency)
CREATE INDEX IF NOT EXISTS idx_api_rate_limits_endpoint_ip 
ON public.api_rate_limits (endpoint, ip_address, window_start);

CREATE INDEX IF NOT EXISTS idx_rate_limit_log_window 
ON public.rate_limit_log (window_start);

CREATE INDEX IF NOT EXISTS idx_push_subscriptions_user_id 
ON public.push_subscriptions (user_id);

-- RLS enable (idempotent)
ALTER TABLE public.push_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.api_rate_limits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rate_limit_log ENABLE ROW LEVEL SECURITY;

-- Only create policies that don't exist yet
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'api_rate_limits' AND policyname = 'Only admins can view rate limits') THEN
    CREATE POLICY "Only admins can view rate limits"
    ON public.api_rate_limits FOR SELECT TO authenticated
    USING (public.is_admin());
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'rate_limit_log' AND policyname = 'Only admins can view rate limit logs') THEN
    CREATE POLICY "Only admins can view rate limit logs"
    ON public.rate_limit_log FOR SELECT TO authenticated
    USING (public.is_admin());
  END IF;
END $$;

-- Cleanup function
CREATE OR REPLACE FUNCTION public.cleanup_old_rate_limits()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  DELETE FROM public.api_rate_limits WHERE window_start < now() - INTERVAL '2 hours';
  DELETE FROM public.rate_limit_log WHERE window_start < now() - INTERVAL '24 hours';
END;
$$;
