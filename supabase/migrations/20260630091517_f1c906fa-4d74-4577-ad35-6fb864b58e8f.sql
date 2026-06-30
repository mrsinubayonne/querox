
CREATE TABLE IF NOT EXISTS public.floor_plan_zones (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  outlet_id uuid NOT NULL,
  name text NOT NULL,
  sort_order integer NOT NULL DEFAULT 0,
  width integer NOT NULL DEFAULT 1200,
  height integer NOT NULL DEFAULT 800,
  background_color text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.floor_plan_zones TO authenticated;
GRANT ALL ON public.floor_plan_zones TO service_role;
ALTER TABLE public.floor_plan_zones ENABLE ROW LEVEL SECURITY;

CREATE POLICY "owner manage zones" ON public.floor_plan_zones
  FOR ALL TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "team view zones" ON public.floor_plan_zones
  FOR SELECT TO authenticated
  USING (public.team_member_has_outlet_access(user_id, outlet_id));

CREATE POLICY "team manage zones" ON public.floor_plan_zones
  FOR ALL TO authenticated
  USING (public.team_member_can_access(user_id, outlet_id, ARRAY['manage_tables']))
  WITH CHECK (public.team_member_can_access(user_id, outlet_id, ARRAY['manage_tables']));

CREATE INDEX IF NOT EXISTS idx_fpz_outlet ON public.floor_plan_zones(user_id, outlet_id, sort_order);


CREATE TABLE IF NOT EXISTS public.floor_plan_tables (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  outlet_id uuid NOT NULL,
  zone_id uuid NOT NULL REFERENCES public.floor_plan_zones(id) ON DELETE CASCADE,
  table_number text NOT NULL,
  shape text NOT NULL DEFAULT 'rectangle' CHECK (shape IN ('rectangle','round','square','bar')),
  x integer NOT NULL DEFAULT 40,
  y integer NOT NULL DEFAULT 40,
  width integer NOT NULL DEFAULT 80,
  height integer NOT NULL DEFAULT 80,
  rotation integer NOT NULL DEFAULT 0,
  seats integer NOT NULL DEFAULT 4,
  label text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.floor_plan_tables TO authenticated;
GRANT ALL ON public.floor_plan_tables TO service_role;
ALTER TABLE public.floor_plan_tables ENABLE ROW LEVEL SECURITY;

CREATE POLICY "owner manage fp tables" ON public.floor_plan_tables
  FOR ALL TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "team view fp tables" ON public.floor_plan_tables
  FOR SELECT TO authenticated
  USING (public.team_member_has_outlet_access(user_id, outlet_id));

CREATE POLICY "team manage fp tables" ON public.floor_plan_tables
  FOR ALL TO authenticated
  USING (public.team_member_can_access(user_id, outlet_id, ARRAY['manage_tables']))
  WITH CHECK (public.team_member_can_access(user_id, outlet_id, ARRAY['manage_tables']));

CREATE INDEX IF NOT EXISTS idx_fpt_zone ON public.floor_plan_tables(zone_id);
CREATE INDEX IF NOT EXISTS idx_fpt_outlet ON public.floor_plan_tables(user_id, outlet_id);

CREATE TRIGGER trg_fpz_updated_at BEFORE UPDATE ON public.floor_plan_zones
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_fpt_updated_at BEFORE UPDATE ON public.floor_plan_tables
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
