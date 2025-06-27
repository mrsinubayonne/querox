
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const useDefaultMenu = () => {
  const { user } = useAuth();
  const { toast } = useToast();

  const createDefaultMenu = async () => {
    if (!user) {
      console.error('Pas d\'utilisateur connecté pour créer le menu par défaut');
      return;
    }

    try {
      console.log('🔥 Création du menu par défaut pour:', user.id);

      // Créer le menu principal
      const { data: menu, error: menuError } = await supabase
        .from('menus')
        .insert({
          name: 'Menu Principal',
          description: 'Votre menu principal',
          user_id: user.id,
          is_active: true
        })
        .select()
        .single();

      if (menuError) {
        console.error('Erreur création menu:', menuError);
        throw menuError;
      }

      console.log('🔥 Menu créé:', menu.id);

      // Créer les catégories par défaut
      const defaultCategories = [
        { name: 'Entrées', order_index: 0 },
        { name: 'Plats principaux', order_index: 1 },
        { name: 'Desserts', order_index: 2 },
        { name: 'Boissons', order_index: 3 }
      ];

      const categoriesToInsert = defaultCategories.map(cat => ({
        ...cat,
        menu_id: menu.id
      }));

      const { error: categoriesError } = await supabase
        .from('menu_categories')
        .insert(categoriesToInsert);

      if (categoriesError) {
        console.error('Erreur création catégories:', categoriesError);
        throw categoriesError;
      }

      console.log('🔥 Catégories par défaut créées');

      toast({
        title: "Menu créé",
        description: "Votre menu par défaut a été créé avec succès",
      });

    } catch (error: any) {
      console.error('🔥 Erreur création menu par défaut:', error);
      toast({
        title: "Erreur",
        description: "Impossible de créer le menu par défaut",
        variant: "destructive"
      });
    }
  };

  return { createDefaultMenu };
};
