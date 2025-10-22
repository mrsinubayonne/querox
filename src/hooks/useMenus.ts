import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

export interface Menu {
  id: string;
  name: string;
  description?: string;
  user_id: string;
  outlet_id?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  logo_url?: string;
  header_image_url?: string;
}

export interface MenuCategory {
  id: string;
  name: string;
  description?: string;
  menu_id: string;
  order_index: number;
  created_at: string;
}

export interface MenuItem {
  id: string;
  name: string;
  description?: string;
  price: number;
  category_id: string;
  category_name: string;
  image_url?: string;
  is_available: boolean;
  order_index: number;
  allergens?: string[];
  created_at: string;
  updated_at: string;
}

export const useMenus = () => {
  const [menus, setMenus] = useState<Menu[]>([]);
  const [categories, setCategories] = useState<MenuCategory[]>([]);
  const [items, setItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const { user, signOut } = useAuth();
  const { toast } = useToast();
  const fetchingRef = useRef(false);

  const navigate = useNavigate();
  const tokenExpiredHandledRef = useRef(false);
  const fetchMenus = useCallback(async () => {
    if (!user || fetchingRef.current) {
      if (!user) {
        setMenus([]);
        setCategories([]);
        setItems([]);
        setLoading(false);
      }
      return;
    }

    try {
      fetchingRef.current = true;
      setLoading(true);
      setError(null);

      console.log('🔄 Fetching menus for user:', user.id);

      // Get selected outlet
      const { data: profile } = await supabase
        .from('profiles')
        .select('selected_outlet_id')
        .eq('id', user.id)
        .maybeSingle();
      
      const outletId = profile?.selected_outlet_id;

      let query = supabase
        .from('menus')
        .select('*')
        .eq('user_id', user.id);

      // Filter by outlet - strict filtering, no legacy support
      if (outletId) {
        query = query.eq('outlet_id', outletId);
      }

      const { data: menusData, error: menusError } = await query
        .order('created_at', { ascending: true });

      if (menusError) {
        console.error('Error fetching menus:', menusError);
        throw menusError;
      }

      console.log('📋 Menus found:', menusData?.length || 0);
      setMenus(menusData || []);

      // Si aucun menu, ne pas continuer
      if (!menusData || menusData.length === 0) {
        setCategories([]);
        setItems([]);
        return;
      }

      // Récupérer les catégories pour tous les menus de l'utilisateur
      const menuIds = menusData.map(menu => menu.id);
      const { data: categoriesData, error: categoriesError } = await supabase
        .from('menu_categories')
        .select('*')
        .in('menu_id', menuIds)
        .order('menu_id')
        .order('order_index', { ascending: true });

      if (categoriesError) {
        console.error('Error fetching categories:', categoriesError);
        throw categoriesError;
      }

      console.log('📂 Categories found:', categoriesData?.length || 0);
      setCategories(categoriesData || []);

      // Récupérer les items pour toutes les catégories
      if (categoriesData && categoriesData.length > 0) {
        const categoryIds = categoriesData.map(cat => cat.id);
        
        const { data: itemsData, error: itemsError } = await supabase
          .from('menu_items')
          .select(`
            *,
            menu_categories!inner(name)
          `)
          .in('category_id', categoryIds)
          .order('category_id')
          .order('order_index', { ascending: true })
          .order('name');

        if (itemsError) {
          console.error('Error fetching menu items:', itemsError);
          throw itemsError;
        }

        const transformedItems: MenuItem[] = (itemsData || []).map(item => ({
          ...item,
          price: Number(item.price),
          category_name: item.menu_categories?.name || 'Sans catégorie'
        }));

        console.log('🍽️ Menu items found:', transformedItems.length);
        setItems(transformedItems);
      } else {
        setItems([]);
      }

    } catch (error: any) {
      console.error('🚨 Error in fetchMenus:', error);
      const code = error?.code;
      const message = error?.message || '';
      // Gestion spécifique de l'expiration du JWT
      if ((code === 'PGRST301' || message.includes('JWT expired')) && !tokenExpiredHandledRef.current) {
        tokenExpiredHandledRef.current = true;
        toast({
          title: "Session expirée",
          description: "Votre session a expiré. Veuillez vous reconnecter.",
          variant: "destructive",
        });
        try {
          await signOut();
        } finally {
          navigate('/auth');
        }
        return;
      }

      const errorMessage = message || 'Erreur lors du chargement des menus';
      setError(errorMessage);
      toast({
        title: "Erreur",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
      fetchingRef.current = false;
    }
  }, [user?.id, toast, signOut, navigate]);

  const createDefaultMenu = useCallback(async () => {
    if (!user) return null;

    try {
      console.log('🔧 Creating default menu for user:', user.id);

      // Get selected outlet
      const { data: profile } = await supabase
        .from('profiles')
        .select('selected_outlet_id')
        .eq('id', user.id)
        .maybeSingle();
      
      const outletId = profile?.selected_outlet_id;
      if (!outletId) {
        toast({
          title: "Erreur",
          description: "Aucun point de vente sélectionné",
          variant: "destructive"
        });
        return null;
      }

      const { data: menu, error: menuError } = await supabase
        .from('menus')
        .insert({
          name: 'Menu Principal',
          description: 'Votre menu principal',
          user_id: user.id,
          outlet_id: outletId,
          is_active: true
        })
        .select()
        .single();

      if (menuError) {
        console.error('Error creating default menu:', menuError);
        throw menuError;
      }

      console.log('✅ Default menu created:', menu.id);

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
        console.error('Error creating default categories:', categoriesError);
        throw categoriesError;
      }

      console.log('✅ Default categories created');

      toast({
        title: "Menu créé",
        description: "Votre menu par défaut a été créé avec succès",
      });

      // Recharger les données
      await fetchMenus();
      return menu.id;

    } catch (error: any) {
      console.error('🚨 Error creating default menu:', error);
      toast({
        title: "Erreur",
        description: "Impossible de créer le menu par défaut",
        variant: "destructive"
      });
      return null;
    }
  }, [user?.id, toast, fetchMenus]);

  const refetch = useCallback(() => {
    return fetchMenus();
  }, [fetchMenus]);

  const transferMenu = useCallback(async (menuId: string, newOutletId: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('menus')
        .update({ outlet_id: newOutletId })
        .eq('id', menuId)
        .eq('user_id', user?.id);

      if (error) {
        console.error('Error transferring menu:', error);
        toast({
          title: "Erreur",
          description: "Impossible de transférer le menu",
          variant: "destructive"
        });
        return false;
      }

      toast({
        title: "Succès",
        description: "Menu transféré avec succès"
      });
      await fetchMenus();
      return true;
    } catch (error) {
      console.error('Error transferring menu:', error);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors du transfert",
        variant: "destructive"
      });
      return false;
    }
  }, [user?.id, toast, fetchMenus]);

  useEffect(() => {
    fetchMenus();
  }, [fetchMenus]);

  const fetchAllMenus = useCallback(async (): Promise<Menu[]> => {
    if (!user) return [];

    try {
      const { data, error } = await supabase
        .from('menus')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching all menus:', error);
      return [];
    }
  }, [user?.id]);

  const fetchAllCategories = useCallback(async (): Promise<MenuCategory[]> => {
    if (!user) return [];

    try {
      const { data: allMenus } = await supabase
        .from('menus')
        .select('id')
        .eq('user_id', user.id);

      if (!allMenus || allMenus.length === 0) return [];

      const menuIds = allMenus.map(m => m.id);
      const { data, error } = await supabase
        .from('menu_categories')
        .select('*')
        .in('menu_id', menuIds)
        .order('order_index', { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching all categories:', error);
      return [];
    }
  }, [user?.id]);

  return {
    menus,
    categories,
    items,
    loading,
    error,
    refetch,
    createDefaultMenu,
    transferMenu,
    fetchAllMenus,
    fetchAllCategories
  };
};