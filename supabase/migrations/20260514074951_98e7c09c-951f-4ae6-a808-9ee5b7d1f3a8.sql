ALTER TABLE public.debtor_payments
  DROP CONSTRAINT IF EXISTS debtor_payments_outlet_id_fkey;
ALTER TABLE public.debtor_payments
  ADD CONSTRAINT debtor_payments_outlet_id_fkey
  FOREIGN KEY (outlet_id) REFERENCES public.outlets(id) ON DELETE SET NULL;

ALTER TABLE public.inventory_losses
  DROP CONSTRAINT IF EXISTS inventory_losses_outlet_id_fkey;
ALTER TABLE public.inventory_losses
  ADD CONSTRAINT inventory_losses_outlet_id_fkey
  FOREIGN KEY (outlet_id) REFERENCES public.outlets(id) ON DELETE SET NULL;

ALTER TABLE public.menus
  DROP CONSTRAINT IF EXISTS menus_outlet_id_fkey;
ALTER TABLE public.menus
  ADD CONSTRAINT menus_outlet_id_fkey
  FOREIGN KEY (outlet_id) REFERENCES public.outlets(id) ON DELETE SET NULL;

ALTER TABLE public.purchase_orders
  DROP CONSTRAINT IF EXISTS purchase_orders_outlet_id_fkey;
ALTER TABLE public.purchase_orders
  ADD CONSTRAINT purchase_orders_outlet_id_fkey
  FOREIGN KEY (outlet_id) REFERENCES public.outlets(id) ON DELETE SET NULL;