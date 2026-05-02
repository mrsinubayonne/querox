
-- 1. Restrict table_sessions public SELECT (currently any anon can read all active sessions across tenants)
DROP POLICY IF EXISTS "Public can read active sessions they just opened" ON public.table_sessions;
-- Owner-only SELECT remains via existing authenticated policies (auth.uid() = user_id).
-- The QR/public flow inserts sessions but does not need to SELECT them back; it relies on the insert response.

-- 2. Tighten accounting_entries: restrict to admins only (it is an admin-only manual ledger)
DROP POLICY IF EXISTS "Authenticated users can view accounting entries" ON public.accounting_entries;
DROP POLICY IF EXISTS "Authenticated users can insert accounting entries" ON public.accounting_entries;
DROP POLICY IF EXISTS "Authenticated users can update accounting entries" ON public.accounting_entries;
DROP POLICY IF EXISTS "Admins can delete accounting entries" ON public.accounting_entries;

CREATE POLICY "Admins can view accounting entries"
ON public.accounting_entries FOR SELECT TO authenticated
USING (public.is_admin());

CREATE POLICY "Admins can insert accounting entries"
ON public.accounting_entries FOR INSERT TO authenticated
WITH CHECK (public.is_admin());

CREATE POLICY "Admins can update accounting entries"
ON public.accounting_entries FOR UPDATE TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

CREATE POLICY "Admins can delete accounting entries"
ON public.accounting_entries FOR DELETE TO authenticated
USING (public.is_admin());

-- 3. Fix public_reset_password: do not leak user UUID or distinguish existing emails
CREATE OR REPLACE FUNCTION public.public_reset_password(user_email text, new_password text)
 RETURNS json
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  target_user_id UUID;
BEGIN
  IF length(new_password) < 6 THEN
    RETURN json_build_object('success', false, 'message', 'Le mot de passe doit contenir au moins 6 caractères');
  END IF;

  SELECT id INTO target_user_id
  FROM auth.users
  WHERE email = user_email AND deleted_at IS NULL;

  -- Always return a generic response without leaking existence or UUID.
  -- The reset-user-password edge function performs the actual reset using the service role
  -- and looks up the user itself.
  RETURN json_build_object('success', true, 'message', 'Si un compte existe pour cet email, le mot de passe a été mis à jour.');
END;
$function$;

-- Restrict execution: only allow service-role-equivalent paths. Revoke from anon/authenticated entirely.
REVOKE EXECUTE ON FUNCTION public.public_reset_password(text, text) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.public_reset_password(text, text) FROM anon;
REVOKE EXECUTE ON FUNCTION public.public_reset_password(text, text) FROM authenticated;
