
-- Add the `order_type` column to the `orders` table
ALTER TABLE public.orders ADD COLUMN order_type TEXT;

-- Optional: If you want to ensure only specific values are used, you could add a CHECK constraint (uncomment if needed)
-- ALTER TABLE public.orders ADD CONSTRAINT order_type_check CHECK (order_type IN ('sur_place', 'emporter', 'livrer'));
