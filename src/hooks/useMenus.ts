
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Menu {
  id: string;
  name: string;
  description?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface MenuCategory {
  id: string;
  menu_id: string;
  name: string;
  description?: string;
  order_index: number;
  created_at: string;
}

interface MenuItem {
  id: string;
  category_id: string;
  name: string;
  description?: string;
  price: number;
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
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchMenus = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('menus')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setMenus(data || []);
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: "Impossible de charger les menus",
        variant: "destructive"
      });
    }
  };

  const fetchCategories = async (menuId?: string) => {
    if (!user) return;
    
    try {
      let query = supabase.from('menu_categories').select('*');
      
      if (menuId) {
        query = query.eq('menu_id', menuId);
      }
      
      const { data, error } = await query.order('order_index', { ascending: true });

      if (error) throw error;
      setCategories(data || []);
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: "Impossible de charger les catégories",
        variant: "destructive"
      });
    }
  };

  const fetchItems = async (categoryId?: string) => {
    if (!user) return;
    
    try {
      let query = supabase.from('menu_items').select('*');
      
      if (categoryId) {
        query = query.eq('category_id', categoryId);
      }
      
      const { data, error } = await query.order('order_index', { ascending: true });

      if (error) throw error;
      setItems(data || []);
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: "Impossible de charger les plats",
        variant: "destructive"
      });
    }
  };

  const createMenu = async (menuData: Partial<Menu>) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('menus')
        .insert([{ ...menuData, user_id: user.id }])
        .select()
        .single();

      if (error) throw error;
      
      setMenus(prev => [data, ...prev]);
      toast({
        title: "Succès",
        description: "Menu créé avec succès"
      });
      
      return data;
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: "Impossible de créer le menu",
        variant: "destructive"
      });
    }
  };

  const createCategory = async (categoryData: Partial<MenuCategory>) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('menu_categories')
        .insert([categoryData])
        .select()
        .single();

      if (error) throw error;
      
      setCategories(prev => [...prev, data]);
      toast({
        title: "Succès",
        description: "Catégorie créée avec succès"
      });
      
      return data;
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: "Impossible de créer la catégorie",
        variant: "destructive"
      });
    }
  };

  const createItem = async (itemData: Partial<MenuItem>) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('menu_items')
        .insert([itemData])
        .select()
        .single();

      if (error) throw error;
      
      setItems(prev => [...prev, data]);
      toast({
        title: "Succès",
        description: "Plat créé avec succès"
      });
      
      return data;
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: "Impossible de créer le plat",
        variant: "destructive"
      });
    }
  };

  useEffect(() => {
    if (user) {
      setLoading(true);
      Promise.all([fetchMenus(), fetchCategories(), fetchItems()])
        .finally(() => setLoading(false));
    }
  }, [user]);

  return {
    menus,
    categories,
    items,
    loading,
    fetchMenus,
    fetchCategories,
    fetchItems,
    createMenu,
    createCategory,
    createItem
  };
};
