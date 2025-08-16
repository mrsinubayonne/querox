-- Enable Row Level Security on admin_revenue_stats table
ALTER TABLE public.admin_revenue_stats ENABLE ROW LEVEL SECURITY;

-- Create RLS policy to restrict access to admin users only
CREATE POLICY "admin_revenue_stats_admin_only" 
ON public.admin_revenue_stats 
FOR SELECT 
USING (public.is_admin());

-- Ensure the view uses proper security by recreating it with security definer
DROP VIEW IF EXISTS public.admin_revenue_stats;

-- Create the admin_revenue_stats view with proper security
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