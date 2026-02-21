-- Force clear ALL stuck sessions across ALL accounts
UPDATE public.table_sessions 
SET status = 'paid', updated_at = now() 
WHERE status IN ('active', 'closed')
AND started_at < now() - interval '12 hours';