
-- Activer la RLS sur les tables si ce n'est pas fait
ALTER TABLE public.website_pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.website_gallery ENABLE ROW LEVEL SECURITY;

-- Politique : un utilisateur peut lire les pages de son site
CREATE POLICY "Users can read their own website pages"
  ON public.website_pages
  FOR SELECT
  USING (
    website_id IN (
      SELECT id FROM public.websites WHERE user_id = auth.uid()
    )
  );

-- Politique : un utilisateur peut créer/modifier/supprimer ses propres pages
CREATE POLICY "Users can manage their own website pages"
  ON public.website_pages
  FOR ALL
  USING (
    website_id IN (
      SELECT id FROM public.websites WHERE user_id = auth.uid()
    )
  )
  WITH CHECK (
    website_id IN (
      SELECT id FROM public.websites WHERE user_id = auth.uid()
    )
  );

-- Activer RLS sur la galerie d'images
CREATE POLICY "Users can read their own website gallery"
  ON public.website_gallery
  FOR SELECT
  USING (
    website_id IN (
      SELECT id FROM public.websites WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can manage their own website gallery"
  ON public.website_gallery
  FOR ALL
  USING (
    website_id IN (
      SELECT id FROM public.websites WHERE user_id = auth.uid()
    )
  )
  WITH CHECK (
    website_id IN (
      SELECT id FROM public.websites WHERE user_id = auth.uid()
    )
  );
