
import { useState, useEffect, useCallback } from 'react';
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

export const useOptimizedMenus = () => {
  const [items, setItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();
  const { createDefaultMenu } = useDefaultMenu();

  const fetchMenuItems = useCallback(async () => {
    if (!user) {
      console.log('🔥 Pas d\'utilisateur connecté');
      setItems([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      console.log('🔥 Début récupération des plats pour l\'utilisateur:', user.id);
      
      // Étape 1: Récupérer les menus de l'utilisateur
      const { data: userMenus, error: menuError } = await supabase
        .from('menus')
        .select('id')
        .eq('user_id', user.id)
        .limit(1);

      if (menuError) {
        console.error('Erreur récupération menus:', menuError);
        throw menuError;
      }

      if (!userMenus || userMenus.length === 0) {
        console.log('🔥 Aucun menu trouvé, création du menu par défaut...');
        await createDefaultMenu();
        setItems([]);
        setLoading(false);
        return;
      }

      const menuId = userMenus[0].id;
      console.log('🔥 Menu trouvé:', menuId);

      // Étape 2: Récupérer les catégories pour ce menu
      const { data: categories, error: categoriesError } = await supabase
        .from('menu_categories')
        .select('id, name')
        .eq('menu_id', menuId);

      if (categoriesError) {
        console.error('Erreur récupération catégories:', categoriesError);
        throw categoriesError;
      }

      if (!categories || categories.length === 0) {
        console.log('🔥 Aucune catégorie trouvée');
        setItems([]);
        setLoading(false);
        return;
      }

      console.log('🔥 Catégories trouvées:', categories.length);
      const categoryMap = new Map(categories.map(c => [c.id, c.name]));
      const categoryIds = categories.map(c => c.id);

      // Étape 3: Récupérer les plats pour ces catégories
      const { data: menuItems, error: itemsError } = await supabase
        .from('menu_items')
        .select('*')
        .in('category_id', categoryIds)
        .order('name');

      if (itemsError) {
        console.error('Erreur récupération plats:', itemsError);
        throw itemsError;
      }

      console.log('🔥 Plats récupérés:', menuItems?.length || 0);

      // Transformer les données
      const transformedItems: MenuItem[] = (menuItems || []).map(item => ({
        id: item.id,
        name: item.name,
        description: item.description,
        price: Number(item.price),
        category: categoryMap.get(item.category_id) || 'Non catégorisé',
        image: item.image_url,
        isActive: item.is_available,
        allergens: item.allergens
      }));

      console.log('🔥 Plats transformés:', transformedItems.length);
      setItems(transformedItems);
    } catch (error: any) {
      console.error('🔥 Erreur complète:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les plats",
        variant: "destructive"
      });
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [user, createDefaultMenu, toast]);

  useEffect(() => {
    fetchMenuItems();
  }, [fetchMenuItems]);

  return {
    items,
    loading,
    refetch: fetchMenuItems
  };
};
