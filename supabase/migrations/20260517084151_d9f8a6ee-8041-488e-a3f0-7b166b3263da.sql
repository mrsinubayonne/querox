-- Enable pg_cron for scheduled jobs
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Schedule cleanup hourly (drop existing schedule if present)
DO $$
BEGIN
  PERFORM cron.unschedule('cleanup-stale-table-sessions-hourly');
EXCEPTION WHEN OTHERS THEN
  NULL;
END $$;

SELECT cron.schedule(
  'cleanup-stale-table-sessions-hourly',
  '0 * * * *',
  $$ SELECT public.cleanup_stale_table_sessions(); $$
);

-- One-shot cleanup of existing backlog
SELECT public.cleanup_stale_table_sessions();