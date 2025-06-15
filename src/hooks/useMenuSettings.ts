
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useMenusList } from './useMenusList';
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
  const { menus: menuList, loading: loadingMenus } = useMenusList();
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
      if (data) setMenu(data);
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

  const uploadImage = async (file: string, bucket: string): Promise<string | null> => {
    try {
      const response = await fetch(file);
      const blob = await response.blob();
      const filePath = `public/${uuidv4()}`;
      
      const { data, error } = await supabase.storage
        .from(bucket)
        .upload(filePath, blob, {
          contentType: blob.type,
          upsert: true,
        });

      if (error) throw error;
      
      const { data: urlData } = supabase.storage.from(bucket).getPublicUrl(data.path);
      return urlData.publicUrl;

    } catch (error: any) {
      console.error('Error uploading image:', error);
      toast({ title: "Erreur d'upload", description: `Impossible d'uploader l'image: ${error.message}`, variant: "destructive" });
      return null;
    }
  };

  const updateMenuSettings = async (updates: Partial<Omit<MenuSettings, 'id'>>) => {
    if (!menu) return;

    setIsSaving(true);
    try {
      const newUpdates = { ...updates };

      if (newUpdates.logo_url && newUpdates.logo_url.startsWith('data:image')) {
        const uploadedUrl = await uploadImage(newUpdates.logo_url, 'menu-assets');
        if (uploadedUrl) newUpdates.logo_url = uploadedUrl;
        else delete newUpdates.logo_url;
      }

      if (newUpdates.header_image_url && newUpdates.header_image_url.startsWith('data:image')) {
        const uploadedUrl = await uploadImage(newUpdates.header_image_url, 'menu-assets');
        if (uploadedUrl) newUpdates.header_image_url = uploadedUrl;
        else delete newUpdates.header_image_url;
      }
      
      const { data, error } = await supabase
        .from('menus')
        .update(newUpdates)
        .eq('id', menu.id)
        .select()
        .single();
      
      if (error) throw error;

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
