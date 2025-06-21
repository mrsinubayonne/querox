
-- Créer des politiques RLS pour permettre aux administrateurs de gérer les abonnements
-- D'abord, supprimer les politiques existantes si elles existent
DROP POLICY IF EXISTS "select_own_subscription" ON public.subscribers;
DROP POLICY IF EXISTS "update_own_subscription" ON public.subscribers;
DROP POLICY IF EXISTS "insert_subscription" ON public.subscribers;

-- Créer une fonction pour vérifier si un utilisateur est administrateur
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM auth.users
    WHERE auth.users.id = auth.uid()
    AND auth.users.email IN (
      'emmanuelhussinbayonne@gmail.com',
      'bayonnecastadorkhloe@gmail.com', 
      'mrsinulion@gmail.com'
    )
  );
$$;

-- Créer les nouvelles politiques RLS
CREATE POLICY "Users can view their own subscription or admins can view all" 
ON public.subscribers
FOR SELECT
USING (
  user_id = auth.uid() 
  OR email = auth.email()
  OR public.is_admin()
);

CREATE POLICY "Admins can insert subscriptions" 
ON public.subscribers
FOR INSERT
WITH CHECK (public.is_admin());

CREATE POLICY "Users can update their own subscription or admins can update all" 
ON public.subscribers
FOR UPDATE
USING (
  user_id = auth.uid() 
  OR email = auth.email()
  OR public.is_admin()
);

CREATE POLICY "Admins can delete subscriptions" 
ON public.subscribers
FOR DELETE
USING (public.is_admin());
