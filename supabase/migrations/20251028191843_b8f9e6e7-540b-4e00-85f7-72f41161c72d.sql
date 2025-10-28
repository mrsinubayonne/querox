-- Vérifier si le trigger existe déjà et le supprimer si nécessaire
DROP TRIGGER IF EXISTS create_owner_profile_on_outlet_trigger ON public.outlets;

-- Créer le trigger pour créer automatiquement le profil propriétaire
CREATE TRIGGER create_owner_profile_on_outlet_trigger
  AFTER INSERT ON public.outlets
  FOR EACH ROW
  EXECUTE FUNCTION public.create_owner_profile_on_outlet();

-- Vérifier si le trigger handle_new_user existe
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Créer le trigger pour créer automatiquement le profil utilisateur
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();