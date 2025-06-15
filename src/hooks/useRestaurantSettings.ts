
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface WebsiteSettings {
  id: string;
  name: string;
}

export function useRestaurantSettings() {
  const [website, setWebsite] = useState<WebsiteSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  // On suppose qu'il n'y a qu'un seul site web principal à éditer pour l'utilisateur
  useEffect(() => {
    const fetchWebsite = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('websites')
          .select('id, name')
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

  const updateWebsiteName = async (name: string) => {
    if (!website) return;
    setIsSaving(true);
    try {
      const { data, error } = await supabase
        .from('websites')
        .update({ name })
        .eq('id', website.id)
        .select('id, name')
        .single();
      if (error) throw error;
      setWebsite(data);
      toast({
        title: "Enregistré",
        description: "Le nom du restaurant a été mis à jour.",
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
    updateWebsiteName,
  };
}
