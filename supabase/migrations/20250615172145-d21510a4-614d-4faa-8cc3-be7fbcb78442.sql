
-- Change delivery_time column to accept simple time text like "14:30"
ALTER TABLE public.orders
ALTER COLUMN delivery_time TYPE text;
