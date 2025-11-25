-- Mettre à jour tous les profils Admin par défaut avec le code QRX-27A79
UPDATE user_profiles
SET access_code = 'QRX-27A79'
WHERE title = 'Admin' 
  AND is_default = true 
  AND (access_code IS NULL OR access_code = '');