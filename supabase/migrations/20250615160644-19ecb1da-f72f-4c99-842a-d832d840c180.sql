
-- Drop the existing, restrictive policy for creating orders
DROP POLICY "Users can create their own orders" ON public.orders;

-- Create a new, more permissive policy that allows anyone to create an order
CREATE POLICY "Public users can create orders" ON public.orders FOR INSERT WITH CHECK (true);
