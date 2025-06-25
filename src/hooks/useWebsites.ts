
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

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
  const { toast } = useToast();
  const [websites, setWebsites] = useState<Website[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchWebsites = async () => {
    if (!user) {
      setWebsites([]);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('websites')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching websites:', error);
        toast({
          title: "Erreur",
          description: "Impossible de charger les sites web",
          variant: "destructive",
        });
      } else {
        setWebsites(data || []);
      }
    } catch (error) {
      console.error('Error fetching websites:', error);
    } finally {
      setLoading(false);
    }
  };

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
        toast({
          title: "Erreur",
          description: "Impossible de créer le site web",
          variant: "destructive",
        });
        return false;
      } else {
        setWebsites(prev => [data, ...prev]);
        toast({
          title: "Succès",
          description: "Site web créé avec succès",
        });
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
        toast({
          title: "Erreur",
          description: "Impossible de modifier le site web",
          variant: "destructive",
        });
        return false;
      } else {
        setWebsites(prev => prev.map(website => 
          website.id === id ? data : website
        ));
        toast({
          title: "Succès",
          description: "Site web modifié avec succès",
        });
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
        toast({
          title: "Erreur",
          description: "Impossible de supprimer le site web",
          variant: "destructive",
        });
        return false;
      } else {
        setWebsites(prev => prev.filter(website => website.id !== id));
        toast({
          title: "Succès",
          description: "Site web supprimé avec succès",
        });
        return true;
      }
    } catch (error) {
      console.error('Error deleting website:', error);
      return false;
    }
  };

  useEffect(() => {
    fetchWebsites();
  }, [user]);

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
