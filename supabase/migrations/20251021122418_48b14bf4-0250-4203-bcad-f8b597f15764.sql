-- Add outlet_id to tables that need outlet-specific data
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS outlet_id UUID REFERENCES public.outlets(id) ON DELETE SET NULL;
ALTER TABLE public.inventory_items ADD COLUMN IF NOT EXISTS outlet_id UUID REFERENCES public.outlets(id) ON DELETE SET NULL;
ALTER TABLE public.customers ADD COLUMN IF NOT EXISTS outlet_id UUID REFERENCES public.outlets(id) ON DELETE SET NULL;
ALTER TABLE public.reservations ADD COLUMN IF NOT EXISTS outlet_id UUID REFERENCES public.outlets(id) ON DELETE SET NULL;
ALTER TABLE public.invoices ADD COLUMN IF NOT EXISTS outlet_id UUID REFERENCES public.outlets(id) ON DELETE SET NULL;
ALTER TABLE public.transactions ADD COLUMN IF NOT EXISTS outlet_id UUID REFERENCES public.outlets(id) ON DELETE SET NULL;

-- Update existing data to use the first outlet of each user
UPDATE public.orders o
SET outlet_id = (
  SELECT outlets.id 
  FROM public.outlets 
  WHERE outlets.user_id = o.user_id 
  ORDER BY outlets.created_at ASC 
  LIMIT 1
)
WHERE outlet_id IS NULL;

UPDATE public.inventory_items i
SET outlet_id = (
  SELECT outlets.id 
  FROM public.outlets 
  WHERE outlets.user_id = i.user_id 
  ORDER BY outlets.created_at ASC 
  LIMIT 1
)
WHERE outlet_id IS NULL;

UPDATE public.customers c
SET outlet_id = (
  SELECT outlets.id 
  FROM public.outlets 
  WHERE outlets.user_id = c.user_id 
  ORDER BY outlets.created_at ASC 
  LIMIT 1
)
WHERE outlet_id IS NULL;

UPDATE public.reservations r
SET outlet_id = (
  SELECT outlets.id 
  FROM public.outlets 
  WHERE outlets.user_id = r.user_id 
  ORDER BY outlets.created_at ASC 
  LIMIT 1
)
WHERE outlet_id IS NULL;

UPDATE public.invoices inv
SET outlet_id = (
  SELECT outlets.id 
  FROM public.outlets 
  WHERE outlets.user_id = inv.user_id 
  ORDER BY outlets.created_at ASC 
  LIMIT 1
)
WHERE outlet_id IS NULL;

UPDATE public.transactions t
SET outlet_id = (
  SELECT outlets.id 
  FROM public.outlets 
  WHERE outlets.user_id = t.user_id 
  ORDER BY outlets.created_at ASC 
  LIMIT 1
)
WHERE outlet_id IS NULL;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_orders_outlet_id ON public.orders(outlet_id);
CREATE INDEX IF NOT EXISTS idx_inventory_items_outlet_id ON public.inventory_items(outlet_id);
CREATE INDEX IF NOT EXISTS idx_customers_outlet_id ON public.customers(outlet_id);
CREATE INDEX IF NOT EXISTS idx_reservations_outlet_id ON public.reservations(outlet_id);
CREATE INDEX IF NOT EXISTS idx_invoices_outlet_id ON public.invoices(outlet_id);
CREATE INDEX IF NOT EXISTS idx_transactions_outlet_id ON public.transactions(outlet_id);