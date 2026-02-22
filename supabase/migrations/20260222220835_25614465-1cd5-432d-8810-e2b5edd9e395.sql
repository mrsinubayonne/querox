
UPDATE table_sessions 
SET status = 'paid', closed_at = now() 
WHERE user_id = '328c736d-b113-4f18-80eb-b8b846e6a685' 
AND status IN ('active', 'closed');
