-- Supprimer le code en double pour ne garder que QRX-B2A15 comme code universel caissière
DELETE FROM profile_access_codes 
WHERE profile_title = 'Caissier(e)' AND access_code = 'QRX-CAS77';