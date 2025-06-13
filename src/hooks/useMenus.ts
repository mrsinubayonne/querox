
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
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

export const useMenus = () => {
  const [items, setItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchMenuItems = async () => {
    if (!user) {
      setItems([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
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
