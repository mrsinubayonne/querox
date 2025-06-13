
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Website {
  id: string;
  user_id: string;
  name: string;
  domain?: string;
  logo_url?: string;
  primary_color: string;
  secondary_color: string;
  description?: string;
  address?: string;
  phone?: string;
  email?: string;
  opening_hours: any;
  social_links: any;
  is_published: boolean;
  template_id: string;
  custom_css?: string;
  seo_title?: string;
  seo_description?: string;
  created_at: string;
  updated_at: string;
}

interface WebsiteFormData {
  name: string;
  description?: string;
  address?: string;
  phone?: string;
  email?: string;
  template_id?: string;
  primary_color?: string;
  secondary_color?: string;
}

export const useWebsites = () => {
  const [websites, setWebsites] = useState<Website[]>([]);
  const [currentWebsite, setCurrentWebsite] = useState<Website | null>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchWebsites = async () => {
    if (!user) {
      setWebsites([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('websites')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching websites:', error);
        throw error;
      }

      setWebsites(data || []);
      
      // Set the first website as current if none is set
      if (data && data.length > 0 && !currentWebsite) {
        setCurrentWebsite(data[0]);
      }
    } catch (error: any) {
      console.error('Websites fetch error:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les sites web",
        variant: "destructive"
      });
      setWebsites([]);
    } finally {
      setLoading(false);
    }
  };

  const createWebsite = async (websiteData: WebsiteFormData) => {
    if (!user) {
      toast({
        title: "Erreur",
        description: "Vous devez être connecté pour créer un site web",
        variant: "destructive"
      });
      return false;
    }

    try {
      const { data, error } = await supabase
        .from('websites')
        .insert([{ 
          ...websiteData, 
          user_id: user.id,
          primary_color: websiteData.primary_color || '#3B82F6',
          secondary_color: websiteData.secondary_color || '#EF4444',
          template_id: websiteData.template_id || 'modern'
        }])
        .select()
        .single();

      if (error) {
        console.error('Error creating website:', error);
        throw error;
      }

      // Create default pages for the website
      await createDefaultPages(data.id);

      setWebsites(prev => [data, ...prev]);
      setCurrentWebsite(data);
      
      toast({
        title: "Succès",
        description: "Site web créé avec succès"
      });

      return data;
    } catch (error: any) {
      console.error('Website creation error:', error);
      toast({
        title: "Erreur",
        description: "Impossible de créer le site web",
        variant: "destructive"
      });
      return false;
    }
  };

  const createDefaultPages = async (websiteId: string) => {
    const defaultPages = [
      {
        website_id: websiteId,
        page_type: 'home',
        title: 'Accueil',
        content: {
          hero_title: 'Bienvenue dans notre restaurant',
          hero_subtitle: 'Une expérience culinaire exceptionnelle vous attend'
        },
        order_index: 1
      },
      {
        website_id: websiteId,
        page_type: 'menu',
        title: 'Notre Menu',
        content: {
          description: 'Découvrez nos spécialités culinaires'
        },
        order_index: 2
      },
      {
        website_id: websiteId,
        page_type: 'about',
        title: 'À Propos',
        content: {
          description: 'L\'histoire de notre restaurant'
        },
        order_index: 3
      },
      {
        website_id: websiteId,
        page_type: 'contact',
        title: 'Contact',
        content: {
          description: 'Contactez-nous pour vos réservations'
        },
        order_index: 4
      }
    ];

    const { error } = await supabase
      .from('website_pages')
      .insert(defaultPages);

    if (error) {
      console.error('Error creating default pages:', error);
    }
  };

  const updateWebsite = async (id: string, updates: Partial<Website>) => {
    if (!user) return false;

    try {
      const { data, error } = await supabase
        .from('websites')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      setWebsites(prev => prev.map(website => website.id === id ? data : website));
      if (currentWebsite && currentWebsite.id === id) {
        setCurrentWebsite(data);
      }
      
      toast({
        title: "Succès",
        description: "Site web mis à jour avec succès"
      });
      
      return data;
    } catch (error: any) {
      console.error('Update error:', error);
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour le site web",
        variant: "destructive"
      });
      return false;
    }
  };

  const publishWebsite = async (id: string) => {
    return updateWebsite(id, { is_published: true });
  };

  const unpublishWebsite = async (id: string) => {
    return updateWebsite(id, { is_published: false });
  };

  useEffect(() => {
    fetchWebsites();
  }, [user]);

  return {
    websites,
    currentWebsite,
    setCurrentWebsite,
    loading,
    fetchWebsites,
    createWebsite,
    updateWebsite,
    publishWebsite,
    unpublishWebsite
  };
};
