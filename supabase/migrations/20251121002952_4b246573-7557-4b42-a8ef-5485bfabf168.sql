-- Create accounting entries table for manual financial records
CREATE TABLE IF NOT EXISTS public.accounting_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  amount NUMERIC NOT NULL,
  entry_type TEXT NOT NULL CHECK (entry_type IN ('revenue', 'expense', 'projection')),
  category TEXT NOT NULL,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.accounting_entries ENABLE ROW LEVEL SECURITY;

-- Policy for admins to manage all entries
CREATE POLICY "Admins can manage accounting entries"
  ON public.accounting_entries
  FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- Add trigger for updated_at
CREATE TRIGGER update_accounting_entries_updated_at
  BEFORE UPDATE ON public.accounting_entries
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();