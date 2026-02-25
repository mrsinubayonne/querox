-- Clean remaining ghost sessions
UPDATE public.table_sessions SET status = 'paid', closed_at = COALESCE(closed_at, now()) WHERE status IN ('active', 'closed');
