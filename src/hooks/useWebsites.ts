import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface Website {
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
  
  // New customizable fields
  hero_title?: string;
  hero_subtitle?: string;
  hero_image_url?: string;
  hero_button_primary?: string;
  hero_button_secondary?: string;
  
  stats_experience?: string;
  stats_clients?: string;
  stats_dishes?: string;
  stats_rating?: string;
  
  specialities_title?: string;
  specialities_subtitle?: string;
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
  
  contact_title?: string;
  contact_subtitle?: string;
}

export interface WebsiteFormData {
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
      setCurrentWebsite(null);
      setLoading(false);
      return;
    }

    try {
      console.log('Fetching websites for user:', user.id);
      setLoading(true);
      const { data, error } = await supabase
        .from('websites')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching websites:', error);
        throw error;
      }

      console.log('Websites fetched:', data);
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
      console.log('Creating website with data:', websiteData);
      
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

      console.log('Website created successfully:', data);

      // Create default pages for the website
      await createDefaultPages(data.id);

      // Update the websites list and current website
      setWebsites(prev => [data, ...prev]);
      setCurrentWebsite(data);
      
      toast({
        title: "Succès",
        description: `Site web "${data.name}" créé avec succès !`,
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
    try {
      console.log('Creating default pages for website:', websiteId);
      
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
        throw error;
      }

      console.log('Default pages created successfully');
    } catch (error) {
      console.error('Error in createDefaultPages:', error);
      // Don't throw here to avoid breaking the website creation process
    }
  };

  const updateWebsite = async (id: string, updates: Partial<Website>) => {
    if (!user) return false;

    try {
      console.log('Updating website:', id, 'with:', updates);
      
      const { data, error } = await supabase
        .from('websites')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      console.log('Website updated successfully:', data);

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
    const result = await updateWebsite(id, { is_published: true });
    if (result) {
      toast({
        title: "Site publié",
        description: "Votre site web est maintenant en ligne !",
      });
    }
    return result;
  };

  const unpublishWebsite = async (id: string) => {
    const result = await updateWebsite(id, { is_published: false });
    if (result) {
      toast({
        title: "Site dépublié",
        description: "Votre site web n'est plus en ligne",
        variant: "destructive"
      });
    }
    return result;
  };

  useEffect(() => {
    if (user) {
      fetchWebsites();
    }
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
