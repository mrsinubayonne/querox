
-- Create table for website configurations
CREATE TABLE public.websites (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  name TEXT NOT NULL DEFAULT 'Mon Restaurant',
  domain TEXT,
  logo_url TEXT,
  primary_color TEXT DEFAULT '#3B82F6',
  secondary_color TEXT DEFAULT '#EF4444',
  description TEXT,
  address TEXT,
  phone TEXT,
  email TEXT,
  opening_hours JSONB DEFAULT '{}',
  social_links JSONB DEFAULT '{}',
  is_published BOOLEAN DEFAULT false,
  template_id TEXT DEFAULT 'modern',
  custom_css TEXT,
  seo_title TEXT,
  seo_description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create table for website pages
CREATE TABLE public.website_pages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  website_id UUID REFERENCES public.websites(id) ON DELETE CASCADE NOT NULL,
  page_type TEXT NOT NULL, -- 'home', 'menu', 'about', 'contact', 'gallery'
  title TEXT NOT NULL,
  content JSONB DEFAULT '{}',
  is_enabled BOOLEAN DEFAULT true,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create table for website gallery images
CREATE TABLE public.website_gallery (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  website_id UUID REFERENCES public.websites(id) ON DELETE CASCADE NOT NULL,
  image_url TEXT NOT NULL,
  caption TEXT,
  alt_text TEXT,
  order_index INTEGER DEFAULT 0,
  is_featured BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add RLS policies for websites
ALTER TABLE public.websites ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own websites" 
  ON public.websites 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own websites" 
  ON public.websites 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own websites" 
  ON public.websites 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own websites" 
  ON public.websites 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Add RLS policies for website pages
ALTER TABLE public.website_pages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own website pages" 
  ON public.website_pages 
  FOR SELECT 
  USING (EXISTS (
    SELECT 1 FROM public.websites 
    WHERE websites.id = website_pages.website_id 
    AND websites.user_id = auth.uid()
  ));

CREATE POLICY "Users can create their own website pages" 
  ON public.website_pages 
  FOR INSERT 
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.websites 
    WHERE websites.id = website_pages.website_id 
    AND websites.user_id = auth.uid()
  ));

CREATE POLICY "Users can update their own website pages" 
  ON public.website_pages 
  FOR UPDATE 
  USING (EXISTS (
    SELECT 1 FROM public.websites 
    WHERE websites.id = website_pages.website_id 
    AND websites.user_id = auth.uid()
  ));

CREATE POLICY "Users can delete their own website pages" 
  ON public.website_pages 
  FOR DELETE 
  USING (EXISTS (
    SELECT 1 FROM public.websites 
    WHERE websites.id = website_pages.website_id 
    AND websites.user_id = auth.uid()
  ));

-- Add RLS policies for website gallery
ALTER TABLE public.website_gallery ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own website gallery" 
  ON public.website_gallery 
  FOR SELECT 
  USING (EXISTS (
    SELECT 1 FROM public.websites 
    WHERE websites.id = website_gallery.website_id 
    AND websites.user_id = auth.uid()
  ));

CREATE POLICY "Users can create their own website gallery" 
  ON public.website_gallery 
  FOR INSERT 
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.websites 
    WHERE websites.id = website_gallery.website_id 
    AND websites.user_id = auth.uid()
  ));

CREATE POLICY "Users can update their own website gallery" 
  ON public.website_gallery 
  FOR UPDATE 
  USING (EXISTS (
    SELECT 1 FROM public.websites 
    WHERE websites.id = website_gallery.website_id 
    AND websites.user_id = auth.uid()
  ));

CREATE POLICY "Users can delete their own website gallery" 
  ON public.website_gallery 
  FOR DELETE 
  USING (EXISTS (
    SELECT 1 FROM public.websites 
    WHERE websites.id = website_gallery.website_id 
    AND websites.user_id = auth.uid()
  ));

-- Add triggers for updated_at
CREATE TRIGGER update_websites_updated_at
  BEFORE UPDATE ON public.websites
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_website_pages_updated_at
  BEFORE UPDATE ON public.website_pages
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Allow public access to published websites for viewing
CREATE POLICY "Public can view published websites" 
  ON public.websites 
  FOR SELECT 
  USING (is_published = true);

CREATE POLICY "Public can view published website pages" 
  ON public.website_pages 
  FOR SELECT 
  USING (EXISTS (
    SELECT 1 FROM public.websites 
    WHERE websites.id = website_pages.website_id 
    AND websites.is_published = true
  ) AND is_enabled = true);

CREATE POLICY "Public can view published website gallery" 
  ON public.website_gallery 
  FOR SELECT 
  USING (EXISTS (
    SELECT 1 FROM public.websites 
    WHERE websites.id = website_gallery.website_id 
    AND websites.is_published = true
  ));
