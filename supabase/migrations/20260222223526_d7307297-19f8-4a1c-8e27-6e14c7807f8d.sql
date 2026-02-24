
-- Libérer la session bloquée de PUPINA SEBASTIAO (Table 03)
UPDATE table_sessions 
SET status = 'paid', payment_method = 'Espèces'
WHERE id = 'b2ee2c3c-2119-46f9-9636-897e6b544abe'
AND user_id = '328c736d-b113-4f18-80eb-b8b846e6a685';
