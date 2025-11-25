-- Drop the previous function that had issues
DROP FUNCTION IF EXISTS admin_reset_user_password(TEXT, TEXT);

-- Create a simpler public function for password reset without email
-- Note: This is intentionally less secure as per user requirements
CREATE OR REPLACE FUNCTION public_reset_password(
  user_email TEXT,
  new_password TEXT
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  target_user_id UUID;
BEGIN
  -- Find user by email in auth.users
  SELECT id INTO target_user_id
  FROM auth.users
  WHERE email = user_email AND deleted_at IS NULL;

  IF target_user_id IS NULL THEN
    RETURN json_build_object(
      'success', false,
      'message', 'Aucun utilisateur trouvé avec cet email'
    );
  END IF;

  -- Validate password length
  IF length(new_password) < 6 THEN
    RETURN json_build_object(
      'success', false,
      'message', 'Le mot de passe doit contenir au moins 6 caractères'
    );
  END IF;

  -- Return success with user_id for edge function to handle
  RETURN json_build_object(
    'success', true,
    'user_id', target_user_id,
    'message', 'Utilisateur trouvé'
  );
END;
$$;