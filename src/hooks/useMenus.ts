
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useDefaultMenu } from './useDefaultMenu';

interface MenuItem {
  id: string;
  name: string;
  description?: string;
  price: number;
  category: string;
  image?: string;
  isActive: boolean;
  allergens?: string[];
}

export const useMenus = () => {
  const [items, setItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();
  const { createDefaultMenu } = useDefaultMenu();

  const fetchMenuItems = async () => {
    if (!user) {
      setItems([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      
      // First check if user has any menus
      const { data: userMenus, error: menuError } = await supabase
        .from('menus')
        .select('id')
        .eq('user_id', user.id)
        .limit(1);

      if (menuError) {
        console.error('Error checking user menus:', menuError);
        throw menuError;
      }

      // If no menus exist, create a default one
      if (!userMenus || userMenus.length === 0) {
        console.log('No menus found, creating default menu...');
        await createDefaultMenu();
        // After creating default menu, the items will still be empty but that's expected
        setItems([]);
        setLoading(false);
        return;
      }

      // Fetch menu items
      const { data, error } = await supabase
        .from('menu_items')
        .select(`
          *,
          menu_categories!inner(
            name,
            menus!inner(
              user_id
            )
          )
        `)
        .eq('menu_categories.menus.user_id', user.id)
        .order('name');

      if (error) {
        console.error('Error fetching menu items:', error);
        throw error;
      }

      // Transform data to match expected format
      const transformedItems = (data || []).map(item => ({
        id: item.id,
        name: item.name,
        description: item.description,
        price: Number(item.price),
        category: item.menu_categories?.name || 'Non catégorisé',
        image: item.image_url,
        isActive: item.is_available,
        allergens: item.allergens
      }));

      setItems(transformedItems);
    } catch (error: any) {
      console.error('Menu fetch error:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les plats",
        variant: "destructive"
      });
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  const refetch = () => {
    return fetchMenuItems();
  };

  useEffect(() => {
    fetchMenuItems();
  }, [user]);

  return {
    items,
    loading,
    refetch
  };
};
