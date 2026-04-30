DELETE FROM public.orders
WHERE id = '0bf257d1-c654-4315-ab8f-eda0a5eda551'
  AND customer_name = 'TEST RLS'
  AND total_amount = 0
  AND status = 'pending';