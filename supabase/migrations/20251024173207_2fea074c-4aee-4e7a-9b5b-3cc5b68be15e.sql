-- Create enum for outlet roles
CREATE TYPE public.outlet_role AS ENUM ('proprietaire', 'superviseur', 'comptable', 'caissier');

-- Create outlet user roles table
CREATE TABLE public.outlet_user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  outlet_id UUID NOT NULL REFERENCES public.outlets(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.outlet_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(outlet_id, user_id)
);

-- Enable RLS
ALTER TABLE public.outlet_user_roles ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check outlet role
CREATE OR REPLACE FUNCTION public.has_outlet_role(_outlet_id UUID, _user_id UUID, _role public.outlet_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.outlet_user_roles
    WHERE outlet_id = _outlet_id
      AND user_id = _user_id
      AND role = _role
  );
$$;

-- Create function to get user's role for an outlet
CREATE OR REPLACE FUNCTION public.get_user_outlet_role(_outlet_id UUID, _user_id UUID)
RETURNS public.outlet_role
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role
  FROM public.outlet_user_roles
  WHERE outlet_id = _outlet_id
    AND user_id = _user_id
  LIMIT 1;
$$;

-- RLS Policies for outlet_user_roles
CREATE POLICY "Users can view their own outlet roles"
ON public.outlet_user_roles
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Outlet owners can manage roles"
ON public.outlet_user_roles
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.outlets
    WHERE outlets.id = outlet_user_roles.outlet_id
      AND outlets.user_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.outlets
    WHERE outlets.id = outlet_user_roles.outlet_id
      AND outlets.user_id = auth.uid()
  )
);

-- Create trigger for updated_at
CREATE TRIGGER update_outlet_user_roles_updated_at
BEFORE UPDATE ON public.outlet_user_roles
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Automatically create proprietaire role when outlet is created
CREATE OR REPLACE FUNCTION public.create_owner_outlet_role()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.outlet_user_roles (outlet_id, user_id, role)
  VALUES (NEW.id, NEW.user_id, 'proprietaire'::public.outlet_role);
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_outlet_created
AFTER INSERT ON public.outlets
FOR EACH ROW
EXECUTE FUNCTION public.create_owner_outlet_role();