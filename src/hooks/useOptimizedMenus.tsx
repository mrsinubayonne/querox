
import { useState, useEffect, useCallback, useRef } from 'react';
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

export const useOptimizedMenus = () => {
  const [items, setItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();
  const fetchingRef = useRef(false);

  const createDefaultMenu = useCallback(async () => {
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
  }, [user?.id, toast]);

  const fetchMenuItems = useCallback(async () => {
    if (!user || fetchingRef.current) {
      console.log('🔥 Pas d\'utilisateur connecté ou déjà en cours de récupération');
      if (!user) {
        setItems([]);
        setLoading(false);
      }
      return;
    }

    try {
      fetchingRef.current = true;
      setLoading(true);
      console.log('🔥 Début récupération des plats pour l\'utilisateur:', user.id);
      
      // Étape 1: Récupérer les menus de l'utilisateur
      const { data: userMenus, error: menuError } = await supabase
        .from('menus')
        .select('id')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .limit(1);

      if (menuError) {
        console.error('Erreur récupération menus:', menuError);
        throw menuError;
      }

      if (!userMenus || userMenus.length === 0) {
        console.log('🔥 Aucun menu actif trouvé, création du menu par défaut...');
        await createDefaultMenu();
        setItems([]);
        return;
      }

      const menuId = userMenus[0].id;
      console.log('🔥 Menu actif trouvé:', menuId);

      // Étape 2: Récupérer les catégories pour ce menu
      const { data: categories, error: categoriesError } = await supabase
        .from('menu_categories')
        .select('id, name')
        .eq('menu_id', menuId)
        .order('order_index', { ascending: true });

      if (categoriesError) {
        console.error('Erreur récupération catégories:', categoriesError);
        throw categoriesError;
      }

      if (!categories || categories.length === 0) {
        console.log('🔥 Aucune catégorie trouvée');
        setItems([]);
        return;
      }

      console.log('🔥 Catégories trouvées:', categories.length);
      const categoryMap = new Map(categories.map(c => [c.id, c.name]));
      const categoryIds = categories.map(c => c.id);

      // Étape 3: Récupérer les plats disponibles pour ces catégories
      const { data: menuItems, error: itemsError } = await supabase
        .from('menu_items')
        .select('*')
        .in('category_id', categoryIds)
        .eq('is_available', true)
        .order('order_index', { ascending: true })
        .order('name', { ascending: true });

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
      fetchingRef.current = false;
    }
  }, [user?.id, createDefaultMenu, toast]);

  useEffect(() => {
    fetchMenuItems();
  }, [fetchMenuItems]);

  const refetch = useCallback(() => {
    return fetchMenuItems();
  }, [fetchMenuItems]);

  return {
    items,
    loading,
    refetch
  };
};
