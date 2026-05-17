import { toast } from 'sonner';

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface Website {
  id: string;
  name: string;
  slug: string;
  description?: string;
  is_published: boolean;
  domain?: string;
  logo_url?: string;
  header_image_url?: string;
  primary_color: string;
  secondary_color: string;
  template_id: string;
  address?: string;
  phone?: string;
  email?: string;
  opening_hours?: any;
  social_links?: any;
  custom_css?: string;
  seo_title?: string;
  seo_description?: string;
  created_at: string;
  updated_at: string;
  user_id: string;
  
  // Hero section
  hero_title?: string;
  hero_subtitle?: string;
  hero_image_url?: string;
  hero_button_primary?: string;
  hero_button_secondary?: string;
  
  // Stats section
  stats_experience?: string;
  stats_clients?: string;
  stats_dishes?: string;
  stats_rating?: string;
  
  // Specialities section
  specialities_title?: string;
  specialities_subtitle?: string;
  
  // Dishes
  dish1_name?: string;
  dish1_price?: string;
  dish1_rating?: string;
  dish1_image_url?: string;
  
  dish2_name?: string;
  dish2_price?: string;
  dish2_rating?: string;
  dish2_image_url?: string;
  
  dish3_name?: string;
  dish3_price?: string;
  dish3_rating?: string;
  dish3_image_url?: string;
  
  // Contact section
  contact_title?: string;
  contact_subtitle?: string;
}

interface WebsiteFormData {
  name: string;
  description?: string;
  address?: string;
  phone?: string;
  email?: string;
}

export const useWebsites = () => {
  const { user } = useAuth();
  const [websites, setWebsites] = useState<Website[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchWebsites = useCallback(async () => {
    if (!user) {
      setWebsites([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('websites')
        .select('id,name,slug,domain,is_published,primary_color,secondary_color,logo_url,template_id,created_at,updated_at,user_id')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setWebsites(data || []);
    } catch (error: any) {
      console.error('Error fetching websites:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  const createWebsite = async (websiteData: WebsiteFormData) => {
    if (!user) return false;

    try {
      const slug = websiteData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      
      const { data, error } = await supabase
        .from('websites')
        .insert({
          ...websiteData,
          user_id: user.id,
          slug: slug,
          primary_color: '#3B82F6',
          secondary_color: '#EF4444',
          template_id: 'modern',
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating website:', error);
        toast.error("Erreur", { description: "Impossible de créer le site web" });
        return false;
      } else {
        setWebsites(prev => [data, ...prev]);
        toast.success("Succès", { description: "Site web créé avec succès" });
        return data;
      }
    } catch (error) {
      console.error('Error creating website:', error);
      return false;
    }
  };

  const updateWebsite = async (id: string, updates: Partial<Website>) => {
    if (!user) return false;

    try {
      const { data, error } = await supabase
        .from('websites')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) {
        console.error('Error updating website:', error);
        toast.error("Erreur", { description: "Impossible de modifier le site web" });
        return false;
      } else {
        setWebsites(prev => prev.map(website => 
          website.id === id ? data : website
        ));
        toast.success("Succès", { description: "Site web modifié avec succès" });
        return data;
      }
    } catch (error) {
      console.error('Error updating website:', error);
      return false;
    }
  };

  const deleteWebsite = async (id: string) => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from('websites')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) {
        console.error('Error deleting website:', error);
        toast.error("Erreur", { description: "Impossible de supprimer le site web" });
        return false;
      } else {
        setWebsites(prev => prev.filter(website => website.id !== id));
        toast.success("Succès", { description: "Site web supprimé avec succès" });
        return true;
      }
    } catch (error) {
      console.error('Error deleting website:', error);
      return false;
    }
  };

  useEffect(() => {
    fetchWebsites();
  }, [fetchWebsites]);

  return {
    websites,
    loading,
    createWebsite,
    updateWebsite,
    deleteWebsite,
    refetch: fetchWebsites,
  };
};

export type { Website, WebsiteFormData };
