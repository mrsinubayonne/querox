
-- Ajouter des colonnes pour mieux tracker les revenus et périodes d'abonnement
ALTER TABLE subscribers 
ADD COLUMN IF NOT EXISTS subscription_start TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS monthly_revenue NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS last_payment_date TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS subscription_status TEXT DEFAULT 'active';

-- Mettre à jour les abonnements existants avec des valeurs par défaut
UPDATE subscribers 
SET subscription_start = created_at 
WHERE subscription_start IS NULL;

UPDATE subscribers 
SET monthly_revenue = CASE 
  WHEN subscription_tier = 'trial' THEN 0
  WHEN subscription_tier = 'basic' THEN 9.99
  WHEN subscription_tier = 'premium' THEN 19.99
  WHEN subscription_tier = 'enterprise' THEN 49.99
  ELSE 0
END
WHERE monthly_revenue = 0;

UPDATE subscribers 
SET subscription_status = CASE 
  WHEN subscribed = true AND (subscription_end IS NULL OR subscription_end > NOW()) THEN 'active'
  WHEN subscribed = true AND subscription_end <= NOW() THEN 'expired'
  ELSE 'cancelled'
END;

-- Créer une vue pour les statistiques de revenus
CREATE OR REPLACE VIEW admin_revenue_stats AS
SELECT 
  DATE_TRUNC('month', s.created_at) as month,
  COUNT(*) as new_subscribers,
  COUNT(*) FILTER (WHERE s.subscribed = true) as active_subscribers,
  SUM(s.monthly_revenue) FILTER (WHERE s.subscribed = true) as monthly_revenue,
  COUNT(*) FILTER (WHERE s.subscription_status = 'cancelled' AND s.updated_at >= DATE_TRUNC('month', CURRENT_DATE)) as churned_subscribers
FROM subscribers s
GROUP BY DATE_TRUNC('month', s.created_at)
ORDER BY month DESC;

-- Créer une fonction pour calculer le churn rate
CREATE OR REPLACE FUNCTION calculate_churn_rate(period_months INTEGER DEFAULT 1)
RETURNS TABLE(
  period_start DATE,
  period_end DATE,
  active_start INTEGER,
  churned INTEGER,
  churn_rate NUMERIC
) 
LANGUAGE SQL
STABLE
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
