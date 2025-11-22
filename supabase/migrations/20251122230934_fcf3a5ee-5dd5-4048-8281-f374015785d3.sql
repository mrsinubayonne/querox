-- Create trigger to automatically deduct inventory when order status changes to delivered/completed
CREATE TRIGGER trigger_deduct_inventory_from_order
  AFTER INSERT OR UPDATE OF status ON public.orders
  FOR EACH ROW
  EXECUTE FUNCTION public.deduct_inventory_from_order();