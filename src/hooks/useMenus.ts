
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

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

interface MenuCategoryData {
  name: string;
  menus: {
    user_id: string;
  }[];
}

interface MenuItemData {
  id: string;
  name: string;
  description?: string;
  price: number;
  image_url?: string;
  is_available?: boolean;
  allergens?: string[];
  menu_categories: MenuCategoryData[];
}

export const useMenus = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [items, setItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchMenuItems = async () => {
    if (!user) {
      setItems([]);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('menu_items')
        .select(`
          id,
          name,
          description,
          price,
          image_url,
          is_available,
          allergens,
          menu_categories!inner(
            name,
            menus!inner(
              user_id
            )
          )
        `)
        .eq('menu_categories.menus.user_id', user.id);

      if (error) {
        console.error('Error fetching menu items:', error);
        toast({
          title: "Erreur",
          description: "Impossible de charger les plats",
          variant: "destructive",
        });
      } else {
        const formattedItems = data?.map(item => {
          // Safely extract category name
          let categoryName = '';
          if (item.menu_categories && item.menu_categories.length > 0) {
            categoryName = item.menu_categories[0]?.name || '';
          }

          return {
            id: item.id,
            name: item.name,
            description: item.description || '',
            price: Number(item.price),
            category: categoryName,
            image: item.image_url || '/lovable-uploads/eedf6dca-ced1-4275-a5ca-db24eefce183.png',
            isActive: item.is_available || false,
            allergens: item.allergens || []
          };
        }) || [];
        
        setItems(formattedItems);
      }
    } catch (error) {
      console.error('Error fetching menu items:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMenuItems();
  }, [user]);

  return {
    items,
    loading,
    refetch: fetchMenuItems,
  };
};
