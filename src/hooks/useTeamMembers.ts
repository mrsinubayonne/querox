import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useSubscription } from './useSubscription';

export interface TeamMember {
  id: string;
  owner_id: string;
  member_email: string;
  member_user_id: string | null;
  role: string;
  status: 'pending' | 'accepted' | 'rejected';
  invited_at: string;
  accepted_at: string | null;
  created_at: string;
}

const TEAM_LIMITS = {
  'starter': 3,
  'pro': 5,
  'entreprise': 10
};

export const useTeamMembers = () => {
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();
  const { subscription } = useSubscription();

  const getTeamLimit = () => {
    const tier = subscription?.subscription_tier || 'starter';
    return TEAM_LIMITS[tier as keyof typeof TEAM_LIMITS] || 3;
  };

  const canAddMoreMembers = () => {
    const limit = getTeamLimit();
    return teamMembers.length < limit;
  };

  const fetchTeamMembers = async () => {
    if (!user) {
      setTeamMembers([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('team_members')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTeamMembers((data || []) as TeamMember[]);
    } catch (error: any) {
      console.error('Error fetching team members:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les membres de l'équipe",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const inviteMember = async (email: string, role: string = 'member') => {
    if (!user) return;

    if (!canAddMoreMembers()) {
      const limit = getTeamLimit();
      toast({
        title: "Limite atteinte",
        description: `Votre plan ${subscription?.subscription_tier || 'starter'} permet jusqu'à ${limit} membres. Passez à un plan supérieur pour en ajouter plus.`,
        variant: "destructive"
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('team_members')
        .insert({
          owner_id: user.id,
          member_email: email,
          role,
          status: 'pending'
        });

      if (error) throw error;

      toast({
        title: "Invitation envoyée",
        description: `Une invitation a été envoyée à ${email}`,
      });

      await fetchTeamMembers();
    } catch (error: any) {
      console.error('Error inviting member:', error);
      if (error.code === '23505') {
        toast({
          title: "Erreur",
          description: "Ce membre a déjà été invité",
          variant: "destructive"
        });
      } else {
        toast({
          title: "Erreur",
          description: "Impossible d'envoyer l'invitation",
          variant: "destructive"
        });
      }
    }
  };

  const removeMember = async (memberId: string) => {
    try {
      const { error } = await supabase
        .from('team_members')
        .delete()
        .eq('id', memberId);

      if (error) throw error;

      toast({
        title: "Membre supprimé",
        description: "Le membre a été retiré de l'équipe",
      });

      await fetchTeamMembers();
    } catch (error: any) {
      console.error('Error removing member:', error);
      toast({
        title: "Erreur",
        description: "Impossible de retirer le membre",
        variant: "destructive"
      });
    }
  };

  useEffect(() => {
    fetchTeamMembers();
  }, [user]);

  return {
    teamMembers,
    loading,
    inviteMember,
    removeMember,
    canAddMoreMembers,
    getTeamLimit,
    refetch: fetchTeamMembers
  };
};
