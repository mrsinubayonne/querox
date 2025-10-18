import { useState, useEffect, useCallback } from 'react';
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
  access_code?: string;
}

const TEAM_LIMITS = {
  'starter': 3,
  'pro': 10,
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

  const fetchTeamMembers = useCallback(async () => {
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
        .eq('owner_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTeamMembers((data || []) as TeamMember[]);
    } catch (error: any) {
      console.error('Error fetching team members:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

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
      // Generate access code via database function
      const { data: codeData, error: codeError } = await supabase
        .rpc('generate_team_access_code');

      if (codeError) throw codeError;

      const accessCode = codeData as string;

      const { error } = await supabase
        .from('team_members')
        .insert({
          owner_id: user.id,
          member_email: email,
          role,
          status: 'accepted',
          access_code: accessCode,
          accepted_at: new Date().toISOString()
        });

      if (error) throw error;

      toast({
        title: "Membre ajouté",
        description: `Code d'accès généré : ${accessCode}`,
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
          description: "Impossible d'ajouter le membre",
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
  }, [fetchTeamMembers]);

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
