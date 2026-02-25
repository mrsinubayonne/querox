-- Reset global table occupancy so every PDV restarts from clean state
UPDATE public.table_sessions
SET status = 'paid',
    closed_at = COALESCE(closed_at, now()),
    updated_at = now()
WHERE status IN ('active', 'closed');