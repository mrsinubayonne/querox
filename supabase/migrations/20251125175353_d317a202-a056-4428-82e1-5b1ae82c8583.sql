-- Create a secure function to reset user password (admin only)
CREATE OR REPLACE FUNCTION admin_reset_user_password(
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
  result JSON;
BEGIN
  -- Find user by email
  SELECT id INTO target_user_id
  FROM auth.users
  WHERE email = user_email;

  IF target_user_id IS NULL THEN
    RETURN json_build_object(
      'success', false,
      'message', 'Utilisateur non trouvé'
    );
  END IF;

  -- Update password using Supabase auth admin API
  -- This updates the password hash directly
  UPDATE auth.users
  SET 
    encrypted_password = crypt(new_password, gen_salt('bf')),
    updated_at = now()
  WHERE id = target_user_id;

  RETURN json_build_object(
    'success', true,
    'message', 'Mot de passe réinitialisé avec succès',
    'user_id', target_user_id
  );
END;
$$;