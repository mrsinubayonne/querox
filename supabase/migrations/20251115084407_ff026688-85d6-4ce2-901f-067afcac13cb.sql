-- Function to calculate revenue based on actual subscription prices
CREATE OR REPLACE FUNCTION public.get_subscription_revenue_stats()
RETURNS TABLE(
  month timestamp with time zone,
  new_subscribers bigint,
  active_subscribers bigint,
  monthly_revenue numeric,
  churned_subscribers bigint
) 
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
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
            WHEN 'starter' THEN 38704  -- 59€ * 656
            WHEN 'premium' THEN 64944  -- 99€ * 656
            WHEN 'pro' THEN 91184      -- 139€ * 656
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

-- Function to get total restaurant revenue (from orders and invoices)
CREATE OR REPLACE FUNCTION public.get_restaurants_total_revenue()
RETURNS TABLE(
  total_orders_revenue numeric,
  total_invoices_revenue numeric,
  combined_revenue numeric,
  total_restaurants bigint
)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  -- Only allow admin users
  SELECT 
    COALESCE(SUM(o.total_amount), 0) as total_orders_revenue,
    COALESCE(SUM(i.total_amount), 0) as total_invoices_revenue,
    COALESCE(SUM(o.total_amount), 0) + COALESCE(SUM(i.total_amount), 0) as combined_revenue,
    COUNT(DISTINCT COALESCE(o.user_id, i.user_id)) as total_restaurants
  FROM 
    (SELECT user_id, total_amount FROM public.orders WHERE public.is_admin()) o
  FULL OUTER JOIN
    (SELECT user_id, total_amount FROM public.invoices WHERE public.is_admin() AND status = 'paid') i
  ON o.user_id = i.user_id;
$$;