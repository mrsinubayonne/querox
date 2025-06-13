
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const useDefaultMenu = () => {
  const { user } = useAuth();
  const { toast } = useToast();

  const createDefaultMenu = async () => {
    if (!user) return null;

    try {
      // Check if user already has a menu
      const { data: existingMenus, error: checkError } = await supabase
        .from('menus')
        .select('id')
        .limit(1);

      if (checkError) {
        console.error('Error checking for existing menus:', checkError);
        throw checkError;
      }

      if (existingMenus && existingMenus.length > 0) {
        return existingMenus[0];
      }

      // Create default menu
      const { data: menu, error: menuError } = await supabase
        .from('menus')
        .insert([{
          name: 'Menu Principal',
          description: 'Menu par défaut de votre restaurant',
          user_id: user.id,
          is_active: true
        }])
        .select()
        .single();

      if (menuError) {
        console.error('Error creating default menu:', menuError);
        throw menuError;
      }

      // Create default categories
      const defaultCategories = [
        { name: 'Entrées', description: 'Nos délicieuses entrées', order_index: 1 },
        { name: 'Plats principaux', description: 'Nos spécialités', order_index: 2 },
        { name: 'Desserts', description: 'Pour finir en beauté', order_index: 3 },
        { name: 'Boissons', description: 'Nos boissons fraîches', order_index: 4 }
      ];

      const { error: categoriesError } = await supabase
        .from('menu_categories')
        .insert(
          defaultCategories.map(cat => ({
            ...cat,
            menu_id: menu.id
          }))
        );

      if (categoriesError) {
        console.error('Error creating default categories:', categoriesError);
        // Don't throw here, menu creation was successful
      }

      console.log('Default menu and categories created successfully');
      return menu;

    } catch (error: any) {
      console.error('Error in createDefaultMenu:', error);
      toast({
        title: "Erreur",
        description: "Impossible de créer le menu par défaut",
        variant: "destructive"
      });
      return null;
    }
  };

  return { createDefaultMenu };
};
