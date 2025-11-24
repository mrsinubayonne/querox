-- Mise à jour du code d'accès pour le profil Proprio
UPDATE user_profiles 
SET access_code = 'QRX-27A79', 
    updated_at = now()
WHERE id = 'c9bab4ab-afa1-4053-bb66-19b38e2e682e' 
  AND user_id = '5500ab34-3995-4871-8683-4321a6200074';