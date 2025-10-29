-- Add selected_outlet_id to user_profiles table
ALTER TABLE public.user_profiles 
ADD COLUMN IF NOT EXISTS selected_outlet_id UUID REFERENCES public.outlets(id) ON DELETE SET NULL;

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_user_profiles_selected_outlet 
ON public.user_profiles(selected_outlet_id);

-- Add comment
COMMENT ON COLUMN public.user_profiles.selected_outlet_id IS 'The currently selected outlet for this profile';