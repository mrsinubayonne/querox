
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

interface MenuItemForWebsite {
  id: string;
  name: string;
  description?: string;
  price: number;
  image_url?: string;
  is_available: boolean;
}

export const useMenuForWebsite = () => {
  const [menuItems, setMenuItems] = useState<MenuItemForWebsite[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchMenuItems = async () => {
    if (!user) {
      setMenuItems([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('menu_items')
        .select(`
          id,
          name,
          description,
          price,
          image_url,
          is_available,
          menu_categories!inner(
            menus!inner(
              user_id
            )
          )
        `)
        .eq('menu_categories.menus.user_id', user.id)
        .eq('is_available', true)
        .order('name')
        .limit(3);

      if (error) {
        console.error('Error fetching menu items for website:', error);
        throw error;
      }

      setMenuItems(data || []);
    } catch (error) {
      console.error('Error in fetchMenuItems:', error);
      setMenuItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMenuItems();
  }, [user]);

  return {
    menuItems,
    loading,
    refetch: fetchMenuItems
  };
};
