-- Nettoyage final : forcer toutes les sessions active/closed restantes à paid
UPDATE public.table_sessions
SET status = 'paid',
    closed_at = COALESCE(closed_at, now()),
    updated_at = now()
WHERE status IN ('active', 'closed');