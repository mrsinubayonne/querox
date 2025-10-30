-- Create business_periods table for custom day boundaries
CREATE TABLE public.business_periods (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  outlet_id UUID REFERENCES public.outlets(id) ON DELETE CASCADE,
  started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  ended_at TIMESTAMP WITH TIME ZONE,
  total_orders INTEGER DEFAULT 0,
  total_revenue NUMERIC DEFAULT 0,
  total_invoices INTEGER DEFAULT 0,
  paid_invoices INTEGER DEFAULT 0,
  unpaid_invoices INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.business_periods ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own business periods"
ON public.business_periods
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own business periods"
ON public.business_periods
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own business periods"
ON public.business_periods
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own business periods"
ON public.business_periods
FOR DELETE
USING (auth.uid() = user_id);

-- Create index for faster queries
CREATE INDEX idx_business_periods_user_outlet ON public.business_periods(user_id, outlet_id);
CREATE INDEX idx_business_periods_dates ON public.business_periods(started_at, ended_at);

-- Create trigger for updated_at
CREATE TRIGGER update_business_periods_updated_at
BEFORE UPDATE ON public.business_periods
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();