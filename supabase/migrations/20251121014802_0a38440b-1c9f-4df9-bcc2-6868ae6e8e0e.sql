-- Allow admins to view all orders and invoices for admin realtime dashboards

-- Orders: add SELECT policy for admins
CREATE POLICY "Admins can view all orders"
ON public.orders
FOR SELECT
USING (is_admin());

-- Invoices: add SELECT policy for admins
CREATE POLICY "Admins can view all invoices"
ON public.invoices
FOR SELECT
USING (is_admin());