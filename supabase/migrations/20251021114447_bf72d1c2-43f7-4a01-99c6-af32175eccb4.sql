-- Create outlets (points de vente) table
CREATE TABLE public.outlets (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  address TEXT,
  phone TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.outlets ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own outlets" 
ON public.outlets 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own outlets" 
ON public.outlets 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own outlets" 
ON public.outlets 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own outlets" 
ON public.outlets 
FOR DELETE 
USING (auth.uid() = user_id);

-- Add trigger for timestamps
CREATE TRIGGER update_outlets_updated_at
BEFORE UPDATE ON public.outlets
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Add selected_outlet_id to user session storage (using profiles table)
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS selected_outlet_id UUID REFERENCES public.outlets(id) ON DELETE SET NULL;