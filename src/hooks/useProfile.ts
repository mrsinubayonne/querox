
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

interface Profile {
  id: string;
  email: string | null;
  full_name: string | null;
  avatar_url: string | null;
  selected_outlet_id: string | null;
  created_at: string;
  updated_at: string;
}

export const useProfile = () => {
  const { user, signOut } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchProfile();
    } else {
      setProfile(null);
      setLoading(false);
    }
  }, [user]);

  const fetchProfile = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();

      if (error) {
        console.error('Error fetching profile:', error);

        // Si le JWT a expiré, déconnecter l'utilisateur
        if (error.code === 'PGRST301' || error.message?.includes('JWT expired')) {
          toast({
            title: "Session expirée",
            description: "Votre session a expiré. Veuillez vous reconnecter.",
            variant: "destructive",
          });
          await signOut();
          navigate('/auth');
          return;
        }

        // En mode hors-ligne ou erreur réseau, ne pas afficher de toast bloquant
        const isNetworkError = error.message?.toLowerCase().includes('failed to fetch')
          || error.message?.toLowerCase().includes('network');
        if (!isNetworkError) {
          toast({
            title: "Erreur",
            description: "Impossible de charger le profil",
            variant: "destructive",
          });
        }
      } else if (data) {
        setProfile(data);
      } else {
        // Aucune ligne profile : créer un profil minimal côté client
        setProfile({
          id: user.id,
          email: user.email ?? null,
          full_name: (user.user_metadata as any)?.full_name ?? null,
          avatar_url: (user.user_metadata as any)?.avatar_url ?? null,
          selected_outlet_id: null,
          created_at: user.created_at ?? new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (updates: Partial<Profile>) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id);

      if (error) {
        console.error('Error updating profile:', error);
        toast({
          title: "Erreur",
          description: "Impossible de mettre à jour le profil",
          variant: "destructive",
        });
        return false;
      } else {
        // Update local state
        setProfile(prev => prev ? { ...prev, ...updates } : null);
        toast({
          title: "Succès",
          description: "Profil mis à jour avec succès",
        });
        return true;
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue",
        variant: "destructive",
      });
      return false;
    }
  };

  return {
    profile,
    loading,
    updateProfile,
    refetch: fetchProfile,
  };
};
