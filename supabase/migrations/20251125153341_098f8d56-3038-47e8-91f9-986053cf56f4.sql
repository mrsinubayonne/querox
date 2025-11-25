-- Drop the overdue_invoices view that causes security issues
DROP VIEW IF EXISTS public.overdue_invoices CASCADE;

-- Create a secure function to get overdue invoices instead of a view
CREATE OR REPLACE FUNCTION public.get_overdue_invoices()
RETURNS TABLE (
  id UUID,
  user_id UUID,
  outlet_id UUID,
  order_id UUID,
  session_id UUID,
  business_customer_id UUID,
  invoice_number TEXT,
  invoice_type TEXT,
  total_amount NUMERIC,
  status TEXT,
  due_date DATE,
  paid_date DATE,
  payment_terms_days INTEGER,
  siret TEXT,
  billing_address TEXT,
  notes TEXT,
  customer_name TEXT,
  customer_email TEXT,
  customer_phone TEXT,
  items JSONB,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ,
  company_name TEXT,
  contact_person TEXT,
  customer_email_b2b TEXT,
  days_overdue INTEGER
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    i.id,
    i.user_id,
    i.outlet_id,
    i.order_id,
    i.session_id,
    i.business_customer_id,
    i.invoice_number,
    i.invoice_type,
    i.total_amount,
    i.status,
    i.due_date,
    i.paid_date,
    i.payment_terms_days,
    i.siret,
    i.billing_address,
    i.notes,
    i.customer_name,
    i.customer_email,
    i.customer_phone,
    i.items,
    i.created_at,
    i.updated_at,
    bc.company_name,
    bc.contact_person,
    bc.email as customer_email_b2b,
    CASE 
      WHEN i.due_date IS NOT NULL THEN CURRENT_DATE - i.due_date
      ELSE 0
    END as days_overdue
  FROM public.invoices i
  LEFT JOIN public.business_customers bc ON bc.id = i.business_customer_id
  WHERE i.status = 'unpaid'
    AND i.due_date < CURRENT_DATE
    AND i.user_id = auth.uid()
  ORDER BY i.due_date ASC;
$$;

-- Grant execute permission on the function to authenticated users
GRANT EXECUTE ON FUNCTION public.get_overdue_invoices() TO authenticated;