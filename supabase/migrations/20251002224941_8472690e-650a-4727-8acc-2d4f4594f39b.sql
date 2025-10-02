-- Create partners table for affiliate program
CREATE TABLE public.partners (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  company_name TEXT NOT NULL,
  company_type TEXT NOT NULL,
  phone TEXT NOT NULL,
  description TEXT NOT NULL,
  website TEXT,
  commission_rate DECIMAL(5,4) NOT NULL DEFAULT 0.10,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'suspended')),
  referral_code TEXT UNIQUE NOT NULL DEFAULT 'PART' || UPPER(SUBSTRING(gen_random_uuid()::TEXT FROM 1 FOR 6)),
  total_referrals INTEGER NOT NULL DEFAULT 0,
  total_commissions DECIMAL(10,2) NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.partners ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own partner profile"
ON public.partners
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own partner profile"
ON public.partners
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own partner profile"
ON public.partners
FOR UPDATE
USING (auth.uid() = user_id);

-- Create referrals table
CREATE TABLE public.referrals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  partner_id UUID NOT NULL REFERENCES public.partners(id) ON DELETE CASCADE,
  customer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  subscription_tier TEXT NOT NULL,
  commission_amount DECIMAL(10,2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'paid')),
  referred_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  first_payment_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS for referrals
ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;

-- Create policies for referrals
CREATE POLICY "Partners can view their own referrals"
ON public.referrals
FOR SELECT
USING (partner_id IN (
  SELECT id FROM public.partners WHERE user_id = auth.uid()
));

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create trigger for partners
CREATE TRIGGER update_partners_updated_at
BEFORE UPDATE ON public.partners
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();