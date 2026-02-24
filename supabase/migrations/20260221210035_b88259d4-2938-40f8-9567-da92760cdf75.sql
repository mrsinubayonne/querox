UPDATE table_sessions 
SET status = 'paid', closed_at = now() 
WHERE user_id = '328c736d-77a8-4e20-a5e8-5765ff051a3c' 
AND status IN ('active', 'closed');