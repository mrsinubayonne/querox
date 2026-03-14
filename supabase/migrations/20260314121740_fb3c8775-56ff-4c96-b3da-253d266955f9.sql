-- Libération des tables persistantes VIP LA LOYA
UPDATE public.table_sessions
SET status = 'paid',
    payment_method = COALESCE(payment_method, 'Espèces'),
    closed_at = COALESCE(closed_at, now()),
    updated_at = now()
WHERE user_id = '328c736d-b113-4f18-80eb-b8b846e6a685'
  AND outlet_id = '4b90c488-8bfa-4e0e-91a3-3ff83225f3d3'
  AND status IN ('active','closed');