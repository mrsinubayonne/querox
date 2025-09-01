
-- Create the roles table with proper structure
CREATE TABLE public.roles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  permissions TEXT[] NOT NULL DEFAULT '{}',
  is_system BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.roles ENABLE ROW LEVEL SECURITY;

-- Create policies for roles table
CREATE POLICY "Admins can manage all roles" 
  ON public.roles 
  FOR ALL 
  USING (public.is_current_user_admin())
  WITH CHECK (public.is_current_user_admin());

CREATE POLICY "Users can view all roles" 
  ON public.roles 
  FOR SELECT 
  USING (true);

-- Insert some default system roles
INSERT INTO public.roles (name, description, permissions, is_system) VALUES
  ('admin', 'Administrateur système avec tous les privilèges', ARRAY['*'], true),
  ('user', 'Utilisateur standard avec privilèges de base', ARRAY['read', 'create_own', 'update_own'], true),
  ('moderator', 'Modérateur avec privilèges étendus', ARRAY['read', 'create', 'update', 'moderate'], true);

-- Create trigger for updated_at
CREATE TRIGGER update_roles_updated_at
  BEFORE UPDATE ON public.roles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
