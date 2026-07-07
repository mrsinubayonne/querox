-- Table for global announcements (modal + banner)
CREATE TABLE IF NOT EXISTS public.app_announcements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  message text NOT NULL,
  kind text NOT NULL DEFAULT 'modal', -- 'modal' | 'banner' | 'both'
  variant text NOT NULL DEFAULT 'info', -- 'info' | 'success' | 'warning' | 'destructive'
  is_active boolean NOT NULL DEFAULT true,
  starts_at timestamptz NOT NULL DEFAULT now(),
  ends_at timestamptz,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.app_announcements TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.app_announcements TO authenticated;
GRANT ALL ON public.app_announcements TO service_role;

ALTER TABLE public.app_announcements ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can read active announcements" ON public.app_announcements;
CREATE POLICY "Anyone can read active announcements"
  ON public.app_announcements FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Admins can manage announcements" ON public.app_announcements;
CREATE POLICY "Admins can manage announcements"
  ON public.app_announcements FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE OR REPLACE FUNCTION public.tg_touch_updated_at()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END $$;

DROP TRIGGER IF EXISTS t_announcements_updated_at ON public.app_announcements;
CREATE TRIGGER t_announcements_updated_at BEFORE UPDATE ON public.app_announcements
FOR EACH ROW EXECUTE FUNCTION public.tg_touch_updated_at();