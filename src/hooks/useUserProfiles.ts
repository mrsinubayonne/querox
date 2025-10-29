import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useSubscription } from '@/hooks/useSubscription';

export type ProfileTitle = 'Admin' | 'Caissier(e)' | 'Comptable' | 'Serveur';

export interface UserProfile {
  id: string;
  user_id: string;
  title: ProfileTitle;
  name: string | null;
  is_default: boolean;
  created_at: string;
  updated_at: string;
}

export const useUserProfiles = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { subscription } = useSubscription();
  const [profiles, setProfiles] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProfileId, setSelectedProfileId] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      fetchProfiles();
    }
  }, [user]);

  const getProfileLimit = (): number => {
    const tier = subscription?.subscription_tier || 'starter';
    if (tier === 'pro') return 7;
    if (tier === 'premium') return 3;
    return 1; // starter tier
  };

  const canAddMoreProfiles = (): boolean => {
    return profiles.length < getProfileLimit();
  };

  const fetchProfiles = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: true });

      if (error) throw error;

      setProfiles((data || []) as UserProfile[]);

      // Synchroniser la sélection avec le stockage local et la réalité des profils
      const stored = localStorage.getItem('selectedProfileId');
      if (stored) {
        const exists = (data || []).some(p => p.id === stored);
        if (exists) {
          setSelectedProfileId(stored);
        } else {
          // ID stocké invalide -> on réinitialise pour forcer la sélection
          localStorage.removeItem('selectedProfileId');
          setSelectedProfileId(null);
        }
      } else {
        // Ne pas auto-sélectionner, forcer l'utilisateur à choisir
        setSelectedProfileId(null);
      }
    } catch (error: any) {
      console.error('Error fetching profiles:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de charger les profils',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const createProfile = async (title: ProfileTitle, name?: string): Promise<UserProfile | null> => {
    if (!user) return null;

    if (!canAddMoreProfiles()) {
      toast({
        title: 'Limite atteinte',
        description: `Vous avez atteint la limite de ${getProfileLimit()} profils pour votre plan`,
        variant: 'destructive',
      });
      return null;
    }

    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .insert([
          {
            user_id: user.id,
            title,
            name: name || null,
            is_default: profiles.length === 0,
          },
        ])
        .select()
        .single();

      if (error) throw error;

      toast({
        title: 'Profil créé',
        description: 'Le profil a été créé avec succès',
      });

      await fetchProfiles();
      return data as UserProfile;
    } catch (error: any) {
      console.error('Error creating profile:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de créer le profil',
        variant: 'destructive',
      });
      return null;
    }
  };

  const deleteProfile = async (profileId: string): Promise<boolean> => {
    if (!user) return false;

    const profile = profiles.find(p => p.id === profileId);
    if (profile?.is_default) {
      toast({
        title: 'Erreur',
        description: 'Impossible de supprimer le profil par défaut',
        variant: 'destructive',
      });
      return false;
    }

    try {
      const { error } = await supabase
        .from('user_profiles')
        .delete()
        .eq('id', profileId)
        .eq('user_id', user.id);

      if (error) throw error;

      toast({
        title: 'Profil supprimé',
        description: 'Le profil a été supprimé avec succès',
      });

      await fetchProfiles();
      return true;
    } catch (error: any) {
      console.error('Error deleting profile:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de supprimer le profil',
        variant: 'destructive',
      });
      return false;
    }
  };

  const selectProfile = (profileId: string) => {
    setSelectedProfileId(profileId);
    localStorage.setItem('selectedProfileId', profileId);
  };

  const getSelectedProfile = (): UserProfile | null => {
    return profiles.find(p => p.id === selectedProfileId) || null;
  };

  return {
    profiles,
    loading,
    selectedProfileId,
    createProfile,
    deleteProfile,
    selectProfile,
    getSelectedProfile,
    canAddMoreProfiles,
    getProfileLimit,
    refetch: fetchProfiles,
  };
};
