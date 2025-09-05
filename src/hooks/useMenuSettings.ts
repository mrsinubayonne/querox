
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useMenus } from './useMenus';
import { useToast } from '@/hooks/use-toast';
import { v4 as uuidv4 } from 'uuid';

interface MenuSettings {
  id: string;
  name: string;
  description: string | null;
  logo_url: string | null;
  header_image_url: string | null;
}

export const useMenuSettings = () => {
  const { menus: menuList, loading: loadingMenus } = useMenus();
  const { toast } = useToast();
  
  const [menu, setMenu] = useState<MenuSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const activeMenuId = menuList[0]?.id;

  const fetchMenuSettings = useCallback(async () => {
    if (!activeMenuId) {
      if (!loadingMenus) {
        setLoading(false);
      }
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('menus')
        .select('id, name, description, logo_url, header_image_url')
        .eq('id', activeMenuId)
        .single();

      if (error) throw error;
      if (data) {
        console.log('Menu settings fetched:', data);
        setMenu(data);
      }
    } catch (error: any) {
      console.error("Error fetching menu settings:", error);
      toast({ title: "Erreur", description: "Impossible de charger les paramètres du menu.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, [activeMenuId, loadingMenus, toast]);

  useEffect(() => {
    if (activeMenuId) {
        fetchMenuSettings();
    }
  }, [activeMenuId, fetchMenuSettings]);

  const updateMenuSettings = async (updates: Partial<Omit<MenuSettings, 'id'>>) => {
    if (!menu) return;

    console.log('Starting menu settings update with:', updates);
    setIsSaving(true);
    try {
      const newUpdates = { ...updates };

      // Pour cette version, on garde les images en data URL directement
      // Dans une version future, on peut implémenter l'upload vers Supabase Storage
      
      const { data, error } = await supabase
        .from('menus')
        .update(newUpdates)
        .eq('id', menu.id)
        .select()
        .single();
      
      if (error) {
        console.error('Database update error:', error);
        throw error;
      }

      console.log('Menu settings updated successfully:', data);
      setMenu(data);
      toast({ title: "Succès", description: "Paramètres du menu mis à jour." });

    } catch (error: any) {
      console.error('Error updating menu settings:', error);
      toast({ title: "Erreur", description: error.message, variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  };

  return { menu, loading, isSaving, updateMenuSettings, refetch: fetchMenuSettings };
};
