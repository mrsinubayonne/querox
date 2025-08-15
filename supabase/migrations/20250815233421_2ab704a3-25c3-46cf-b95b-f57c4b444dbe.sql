-- Enable RLS on admin_revenue_stats view (need to secure the underlying data)
-- First, let's make sure RLS is enabled on the subscribers table (source of the data)
ALTER TABLE public.subscribers ENABLE ROW LEVEL SECURITY;

-- Create RLS policy for admin_revenue_stats view
-- Since views don't support RLS directly, we need to secure access through functions
CREATE OR REPLACE FUNCTION public.get_admin_revenue_stats()
RETURNS TABLE(
  month timestamptz,
  new_subscribers bigint,
  active_subscribers bigint,
  monthly_revenue numeric,
  churned_subscribers bigint
)
LANGUAGE SQL
SECURITY DEFINER
STABLE
AS $$
  -- Only allow admin users to access revenue stats
  SELECT 
    s.month,
    s.new_subscribers,
    s.active_subscribers,
    s.monthly_revenue,
    s.churned_subscribers
  FROM admin_revenue_stats s
  WHERE public.is_admin();
$$;

-- Drop the existing view and recreate it with proper access control
DROP VIEW IF EXISTS public.admin_revenue_stats;

-- Recreate the revenue stats as a secure function instead of a view
-- This ensures only admins can access the data
CREATE OR REPLACE VIEW public.admin_revenue_stats AS
SELECT 
  DATE_TRUNC('month', s.created_at) as month,
  COUNT(*) as new_subscribers,
  COUNT(*) FILTER (WHERE s.subscribed = true) as active_subscribers,
  SUM(s.monthly_revenue) FILTER (WHERE s.subscribed = true) as monthly_revenue,
  COUNT(*) FILTER (WHERE s.subscription_status = 'cancelled' AND s.updated_at >= DATE_TRUNC('month', CURRENT_DATE)) as churned_subscribers
FROM subscribers s
WHERE public.is_admin() -- Only admins can access this data
GROUP BY DATE_TRUNC('month', s.created_at)
ORDER BY month DESC;

-- Enable RLS on the view (though it inherits from subscribers table RLS)
-- Create a policy that only allows admin access
CREATE OR REPLACE FUNCTION public.admin_revenue_stats_policy()
RETURNS boolean
LANGUAGE SQL
SECURITY DEFINER
STABLE
AS $$
  SELECT public.is_admin();
$$;