-- Drop and recreate the subscription revenue stats function with correct FCFA prices
DROP FUNCTION IF EXISTS public.get_subscription_revenue_stats();

CREATE OR REPLACE FUNCTION public.get_subscription_revenue_stats()
RETURNS TABLE(
  month timestamp with time zone,
  new_subscribers bigint,
  active_subscribers bigint,
  monthly_revenue numeric,
  churned_subscribers bigint
) 
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = 'public'
AS $$
  -- Only allow admin users
  SELECT 
    date_trunc('month', s.created_at) as month,
    COUNT(*) FILTER (WHERE date_trunc('month', s.created_at) = date_trunc('month', s.subscription_start)) as new_subscribers,
    COUNT(*) FILTER (WHERE s.subscribed = true AND s.subscription_status = 'active') as active_subscribers,
    SUM(
      CASE 
        WHEN s.subscribed = true AND s.subscription_status = 'active' THEN
          CASE s.subscription_tier
            WHEN 'starter' THEN 35000
            WHEN 'premium' THEN 65000
            WHEN 'pro' THEN 91000
            ELSE 0
          END
        ELSE 0
      END
    ) as monthly_revenue,
    COUNT(*) FILTER (WHERE s.subscription_status = 'cancelled' OR s.subscription_status = 'expired') as churned_subscribers
  FROM public.subscribers s
  WHERE public.is_admin()
  GROUP BY date_trunc('month', s.created_at)
  ORDER BY month DESC;
$$;