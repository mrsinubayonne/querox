-- Create table if missing
CREATE TABLE IF NOT EXISTS public.table_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  outlet_id UUID,
  table_number TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active','closed','paid')),
  started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  closed_at TIMESTAMPTZ,
  number_of_guests INTEGER,
  total_amount NUMERIC DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.table_sessions ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='table_sessions' AND policyname='Users can manage their own table sessions'
  ) THEN
    CREATE POLICY "Users can manage their own table sessions" ON public.table_sessions FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='table_sessions' AND policyname='Public can create table sessions'
  ) THEN
    CREATE POLICY "Public can create table sessions" ON public.table_sessions FOR INSERT WITH CHECK (true);
  END IF;
END $$;

-- Ensure columns
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='orders' AND column_name='session_id'
  ) THEN
    ALTER TABLE public.orders ADD COLUMN session_id UUID;
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='invoices' AND column_name='session_id'
  ) THEN
    ALTER TABLE public.invoices ADD COLUMN session_id UUID;
  END IF;
END $$;