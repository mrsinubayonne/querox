-- Allow admins to view all outlets
CREATE POLICY "Admins can view all outlets"
ON public.outlets
FOR SELECT
TO authenticated
USING (public.is_admin());