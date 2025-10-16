
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface WebsiteSettings {
  id: string;
  name: string;
  description: string | null;
  logo_url: string | null;
  header_image_url: string | null;
  slug: string | null;
  domain: string | null;
}

export function useRestaurantSettings() {
  const [website, setWebsite] = useState<WebsiteSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const fetchWebsite = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('websites')
          .select('id, name, description, logo_url, header_image_url, slug, domain')
          .order('created_at', { ascending: true })
          .limit(1)
          .single();

        if (error) throw error;
        setWebsite(data);
      } catch (error: any) {
        toast({
          title: "Erreur",
          description: "Impossible de charger les informations du restaurant.",
          variant: "destructive",
        });
        setWebsite(null);
      } finally {
        setLoading(false);
      }
    };

    fetchWebsite();
  }, []);

  const updateWebsiteInfo = async (values: {
    name: string,
    description: string,
    logo_url?: string | null,
    header_image_url?: string | null,
  }) => {
    if (!website) return;
    setIsSaving(true);
    try {
      // upload images to supabase storage si besoin
      // (à faire si bucket existe, ici on stocke directement la valeur en BDD)
      const update: any = {
        name: values.name,
        description: values.description,
        logo_url: values.logo_url ?? null,
        header_image_url: values.header_image_url ?? null,
      };
      const { data, error } = await supabase
        .from('websites')
        .update(update)
        .eq('id', website.id)
        .select('id, name, description, logo_url, header_image_url, slug, domain')
        .single();
      if (error) throw error;
      setWebsite(data);
      toast({
        title: "Enregistré",
        description: "Les informations du restaurant ont été mises à jour.",
      });
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error?.message ?? "Une erreur est survenue",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return {
    website,
    loading,
    isSaving,
    updateWebsiteInfo,
  };
}
