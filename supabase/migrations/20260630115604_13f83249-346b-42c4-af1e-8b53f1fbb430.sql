-- Merge duplicate zones per outlet then enforce 1 zone per outlet
DO $$
DECLARE
  dup RECORD;
  keep_id uuid;
BEGIN
  FOR dup IN SELECT outlet_id FROM public.floor_plan_zones GROUP BY outlet_id HAVING count(*) > 1 LOOP
    SELECT id INTO keep_id FROM public.floor_plan_zones
      WHERE outlet_id = dup.outlet_id ORDER BY created_at ASC NULLS LAST LIMIT 1;
    UPDATE public.floor_plan_tables SET zone_id = keep_id
      WHERE zone_id IN (SELECT id FROM public.floor_plan_zones WHERE outlet_id = dup.outlet_id AND id <> keep_id);
    DELETE FROM public.floor_plan_zones WHERE outlet_id = dup.outlet_id AND id <> keep_id;
  END LOOP;
END$$;

CREATE UNIQUE INDEX IF NOT EXISTS floor_plan_zones_one_per_outlet
  ON public.floor_plan_zones(outlet_id);