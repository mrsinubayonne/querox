REVOKE ALL ON FUNCTION public.create_table_session_with_order(uuid, uuid, text, integer, jsonb, numeric) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.create_table_session_with_order(uuid, uuid, text, integer, jsonb, numeric) FROM anon;
GRANT EXECUTE ON FUNCTION public.create_table_session_with_order(uuid, uuid, text, integer, jsonb, numeric) TO authenticated;