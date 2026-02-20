-- Force clear all stuck sessions for Loya Terrasse
UPDATE public.table_sessions 
SET status = 'paid', updated_at = now() 
WHERE user_id = '328c736d-b113-4f18-80eb-b8b846e6a685' 
AND status IN ('active', 'closed');