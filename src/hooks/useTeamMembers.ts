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
  full_name?: string;
  phone?: string;
  is_active: boolean;
  last_login_at: string | null;
  actions_count: number;
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

  const inviteMember = async (
    email?: string,
    role: string = 'serveur',
    fullName?: string,
    phone?: string,
    outletIds?: string[]
  ) => {
    if (!canAddMoreMembers()) {
      toast({
        title: "Limite atteinte",
        description: `Votre plan ${subscription?.subscription_tier || 'starter'} permet jusqu'à ${getTeamLimit()} membres. Passez à un plan supérieur pour ajouter plus de membres.`,
        variant: "destructive"
      });
      return;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Non authentifié');

      // Generate unique access code (used as invitation token too)
      const accessCode = `QRX-${Math.random().toString(36).substr(2, 5).toUpperCase()}`;

      // Determine outlet_id: use first from outletIds array, or null
      const outletId = outletIds && outletIds.length > 0 ? outletIds[0] : null;

      // Email is now optional - generate temp email if not provided
      const memberEmail = email || `temp_${accessCode}@querox.local`;

      const { error } = await supabase
        .from('team_members')
        .insert({
          owner_id: user.id,
          member_email: memberEmail,
          role,
          full_name: fullName,
          phone,
          access_code: accessCode,
          outlet_id: outletId,
          status: 'pending'
        });

      if (error) throw error;

      toast({
        title: "Membre invité ✅",
        description: `${fullName || email || 'Le membre'} a été ajouté à votre équipe`,
      });

      await fetchTeamMembers();
    } catch (error: any) {
      console.error('Error inviting member:', error);
      toast({
        title: "Erreur",
        description: "Impossible d'inviter le membre",
        variant: "destructive"
      });
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

  const toggleMemberStatus = async (memberId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('team_members')
        .update({ is_active: !currentStatus })
        .eq('id', memberId);

      if (error) throw error;

      toast({
        title: currentStatus ? "Membre désactivé" : "Membre activé",
        description: currentStatus ? "Le membre ne peut plus se connecter" : "Le membre peut maintenant se connecter",
      });

      await fetchTeamMembers();
    } catch (error: any) {
      console.error('Error toggling member status:', error);
      toast({
        title: "Erreur",
        description: "Impossible de modifier le statut du membre",
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
    toggleMemberStatus,
    canAddMoreMembers,
    getTeamLimit,
    refetch: fetchTeamMembers
  };
};
