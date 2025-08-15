-- Fix search path issues for security functions
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
SET search_path TO 'public'
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

CREATE OR REPLACE FUNCTION public.admin_revenue_stats_policy()
RETURNS boolean
LANGUAGE SQL
SECURITY DEFINER
STABLE
SET search_path TO 'public'
AS $$
  SELECT public.is_admin();
$$;

-- Fix the calculate_churn_rate function too
CREATE OR REPLACE FUNCTION public.calculate_churn_rate(period_months integer DEFAULT 1)
RETURNS TABLE(period_start date, period_end date, active_start integer, churned integer, churn_rate numeric)
LANGUAGE SQL
STABLE
SET search_path TO 'public'
AS $$
  WITH period_data AS (
    SELECT 
      DATE_TRUNC('month', CURRENT_DATE - INTERVAL '1 month' * generate_series(0, period_months-1))::DATE as period_start,
      DATE_TRUNC('month', CURRENT_DATE - INTERVAL '1 month' * generate_series(0, period_months-1) + INTERVAL '1 month' - INTERVAL '1 day')::DATE as period_end
  ),
  churn_calc AS (
    SELECT 
      pd.period_start,
      pd.period_end,
      COUNT(*) FILTER (WHERE s.created_at <= pd.period_start AND s.subscribed = true) as active_start,
      COUNT(*) FILTER (WHERE s.updated_at >= pd.period_start AND s.updated_at <= pd.period_end AND s.subscription_status = 'cancelled') as churned
    FROM period_data pd
    CROSS JOIN subscribers s
    GROUP BY pd.period_start, pd.period_end
  )
  SELECT 
    period_start,
    period_end,
    active_start,
    churned,
    CASE 
      WHEN active_start > 0 THEN ROUND((churned::NUMERIC / active_start::NUMERIC) * 100, 2)
      ELSE 0
    END as churn_rate
  FROM churn_calc
  ORDER BY period_start DESC;
$$;