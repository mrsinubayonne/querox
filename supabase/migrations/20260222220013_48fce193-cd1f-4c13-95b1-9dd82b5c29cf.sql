
-- 1. Extend PUPINA's subscription by 30 days
UPDATE subscribers 
SET subscription_end = now() + interval '30 days',
    updated_at = now()
WHERE user_id = '328c736d-b113-4f18-80eb-b8b846e6a685';

-- 2. Force-clear ALL stuck sessions (active/closed) for ALL users
UPDATE table_sessions 
SET status = 'paid', closed_at = COALESCE(closed_at, now())
WHERE status IN ('active', 'closed')
AND started_at < now() - interval '6 hours';

-- 3. Clear PUPINA's current stuck sessions specifically (even recent ones)
UPDATE table_sessions 
SET status = 'paid', closed_at = COALESCE(closed_at, now())
WHERE user_id = '328c736d-b113-4f18-80eb-b8b846e6a685'
AND status IN ('active', 'closed');
