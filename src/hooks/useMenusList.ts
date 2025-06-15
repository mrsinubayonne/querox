
import { useState, useEffect } from 'react';
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

export const useMenusList = () => {
  const [menus, setMenus] = useState<Menu[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const fetchMenus = async () => {
      try {
        console.log("🔥 useMenusList: Début de la récupération des menus");
        
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          console.error("🔥 useMenusList: Aucun utilisateur connecté");
          setError("Utilisateur non connecté");
          return;
        }

        console.log("🔥 useMenusList: Utilisateur connecté:", user.id);

        const { data, error } = await supabase
          .from('menus')
          .select('id, name, description, is_active, created_at, updated_at')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (error) {
          console.error("🔥 useMenusList: Erreur lors de la récupération:", error);
          throw error;
        }

        console.log("🔥 useMenusList: Menus récupérés:", data);
        console.log("🔥 useMenusList: Nombre de menus:", data?.length || 0);

        setMenus(data || []);
        setError(null);

        if (!data || data.length === 0) {
          console.warn("🔥 useMenusList: Aucun menu trouvé pour cet utilisateur");
          toast({
            title: "Aucun menu",
            description: "Vous n'avez pas encore créé de menu. Créez-en un pour commencer.",
            variant: "default",
          });
        }

      } catch (err: any) {
        console.error('🔥 useMenusList: Erreur complète:', err);
        const errorMessage = err.message || 'Erreur lors du chargement des menus';
        setError(errorMessage);
        toast({
          title: "Erreur",
          description: errorMessage,
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchMenus();
  }, [toast]);

  return { menus, loading, error };
};
