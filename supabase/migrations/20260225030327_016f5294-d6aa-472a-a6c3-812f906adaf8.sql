-- Mark all active/closed sessions as paid to free all tables globally
UPDATE public.table_sessions 
SET status = 'paid', closed_at = COALESCE(closed_at, now()), updated_at = now()
WHERE status IN ('active', 'closed');