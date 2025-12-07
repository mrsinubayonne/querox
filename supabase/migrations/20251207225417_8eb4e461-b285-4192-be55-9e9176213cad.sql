-- Create table for tracking button/feature usage
CREATE TABLE public.button_click_tracking (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  button_name TEXT NOT NULL,
  button_category TEXT NOT NULL DEFAULT 'general',
  click_count INTEGER NOT NULL DEFAULT 0,
  last_clicked_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(button_name)
);

-- Enable RLS
ALTER TABLE public.button_click_tracking ENABLE ROW LEVEL SECURITY;

-- Allow anyone to increment clicks (public tracking)
CREATE POLICY "Anyone can view button tracking"
  ON public.button_click_tracking
  FOR SELECT
  USING (true);

-- Only admins can view detailed stats (via RPC function)
CREATE POLICY "Admins can manage button tracking"
  ON public.button_click_tracking
  FOR ALL
  USING (public.is_admin());

-- Function to increment button click count (upsert pattern)
CREATE OR REPLACE FUNCTION public.track_button_click(_button_name TEXT, _button_category TEXT DEFAULT 'general')
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.button_click_tracking (button_name, button_category, click_count, last_clicked_at)
  VALUES (_button_name, _button_category, 1, now())
  ON CONFLICT (button_name) 
  DO UPDATE SET 
    click_count = button_click_tracking.click_count + 1,
    last_clicked_at = now(),
    updated_at = now();
END;
$$;

-- Function to get button usage stats (admin only)
CREATE OR REPLACE FUNCTION public.get_button_usage_stats()
RETURNS TABLE(
  button_name TEXT,
  button_category TEXT,
  click_count INTEGER,
  last_clicked_at TIMESTAMP WITH TIME ZONE
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    button_name,
    button_category,
    click_count,
    last_clicked_at
  FROM public.button_click_tracking
  WHERE public.is_admin()
  ORDER BY click_count DESC;
$$;

-- Add trigger for updated_at
CREATE TRIGGER update_button_click_tracking_updated_at
  BEFORE UPDATE ON public.button_click_tracking
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();