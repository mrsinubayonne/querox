
-- Add the header_image_url column to the websites table if it does not already exist
ALTER TABLE public.websites ADD COLUMN IF NOT EXISTS header_image_url TEXT;
