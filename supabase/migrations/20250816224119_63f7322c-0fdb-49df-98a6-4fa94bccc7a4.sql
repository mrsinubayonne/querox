-- Drop and recreate the admin_revenue_stats view with security_invoker to respect RLS
DROP VIEW IF EXISTS public.admin_revenue_stats;

-- Create the admin_revenue_stats view with security_invoker = true
-- This ensures the view respects the current user's RLS policies
CREATE VIEW public.admin_revenue_stats 
WITH (security_invoker = true)
AS
SELECT 
  DATE_TRUNC('month', s.created_at) as month,
  COUNT(*) FILTER (WHERE s.created_at >= DATE_TRUNC('month', s.created_at)) as new_subscribers,
  COUNT(*) FILTER (WHERE s.subscribed = true) as active_subscribers,
  COALESCE(SUM(s.monthly_revenue), 0) as monthly_revenue,
  COUNT(*) FILTER (WHERE s.subscription_status = 'cancelled' AND s.updated_at >= DATE_TRUNC('month', s.updated_at)) as churned_subscribers
FROM public.subscribers s
WHERE s.created_at >= DATE_TRUNC('month', CURRENT_DATE - INTERVAL '12 months')
GROUP BY DATE_TRUNC('month', s.created_at)
ORDER BY month DESC;

-- Ensure the subscribers table has proper RLS policies for admin access
-- Check if admin access policy exists, if not create it
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'subscribers' 
    AND policyname = 'admin_full_access'
  ) THEN
    CREATE POLICY "admin_full_access" 
    ON public.subscribers 
    FOR ALL 
    USING (public.is_admin())
    WITH CHECK (public.is_admin());
  END IF;
END $$;