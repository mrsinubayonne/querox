import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useSubscription } from './useSubscription';
import { toast } from 'sonner';

export interface TeamMemberOutlet {
  outlet_id: string;
  outlet_name: string;
}

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
  outlets?: TeamMemberOutlet[];
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
      
      // Fetch team members
      const { data: members, error } = await supabase
        .from('team_members')
        .select('*')
        .eq('owner_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Fetch outlets for each member using the RPC function
      const membersWithOutlets: TeamMember[] = await Promise.all(
        (members || []).map(async (member) => {
          const { data: outlets } = await supabase
            .rpc('get_team_member_outlets', { _member_id: member.id });
          
          return {
            ...member,
            outlets: (outlets || []) as TeamMemberOutlet[]
          } as TeamMember;
        })
      );

      setTeamMembers(membersWithOutlets);
    } catch (error: any) {
      console.error('Error fetching team members:', error);
      toast.error("Erreur de chargement", { description: "Impossible de charger l'équipe." });
    } finally {
      setLoading(false);
    }
  }, [user]);

  const inviteMember = async (
    email?: string,
    role: string = 'membre',
    fullName?: string,
    phone?: string,
    outletIds?: string[],
    permissionIds?: string[]
  ) => {
    if (!canAddMoreMembers()) {
      toast.error("Limite atteinte", { description: `Votre plan ${subscription?.subscription_tier || 'starter'} permet jusqu'à ${getTeamLimit()} membres. Passez à un plan supérieur pour ajouter plus de membres.` });
      return;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Non authentifié');

      // Generate unique access code (used as invitation token too) - 6 characters max
      const accessCode = Math.random().toString(36).substr(2, 6).toUpperCase();

      // Email is now optional - generate temp email if not provided
      const memberEmail = email || `temp_${accessCode}@querox.local`;

      // Insert team member (outlet_id kept for backwards compat, but we use team_member_outlets now)
      const { data: newMember, error } = await supabase
        .from('team_members')
        .insert({
          owner_id: user.id,
          member_email: memberEmail,
          role,
          full_name: fullName,
          phone,
          access_code: accessCode,
          outlet_id: outletIds && outletIds.length > 0 ? outletIds[0] : null,
          status: 'pending'
        })
        .select('id')
        .single();

      if (error) throw error;

      // Insert into team_member_outlets for all selected outlets
      if (newMember && outletIds && outletIds.length > 0) {
        const outletInserts = outletIds.map(outletId => ({
          team_member_id: newMember.id,
          outlet_id: outletId
        }));

        const { error: outletsError } = await supabase
          .from('team_member_outlets')
          .insert(outletInserts);

        if (outletsError) {
          console.error('Error inserting team member outlets:', outletsError);
        }
      }

      // Insert direct permissions if provided
      if (newMember && permissionIds && permissionIds.length > 0) {
        const permissionInserts = permissionIds.map(permissionId => ({
          team_member_id: newMember.id,
          permission_id: permissionId
        }));

        const { error: permissionsError } = await supabase
          .from('team_member_permissions')
          .insert(permissionInserts);

        if (permissionsError) {
          console.error('Error inserting team member permissions:', permissionsError);
        }
      }

      toast.success("Membre invité ✅", { description: `${fullName || email || 'Le membre'} a été ajouté à votre équipe` });

      await fetchTeamMembers();
    } catch (error: any) {
      console.error('Error inviting member:', error);
      toast.error("Erreur", { description: "Impossible d'inviter le membre" });
    }
  };

  const removeMember = async (memberId: string) => {
    try {
      // team_member_outlets will be deleted automatically via CASCADE
      const { error } = await supabase
        .from('team_members')
        .delete()
        .eq('id', memberId);

      if (error) throw error;

      toast.success("Membre supprimé", { description: "Le membre a été retiré de l'équipe" });

      await fetchTeamMembers();
    } catch (error: any) {
      console.error('Error removing member:', error);
      toast.error("Erreur", { description: "Impossible de retirer le membre" });
    }
  };

  const toggleMemberStatus = async (memberId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('team_members')
        .update({ is_active: !currentStatus })
        .eq('id', memberId);

      if (error) throw error;

      toast.success(currentStatus ? "Membre désactivé" : "Membre activé", { description: currentStatus ? "Le membre ne peut plus se connecter" : "Le membre peut maintenant se connecter" });

      await fetchTeamMembers();
    } catch (error: any) {
      console.error('Error toggling member status:', error);
      toast.error("Erreur", { description: "Impossible de modifier le statut du membre" });
    }
  };

  const updateMemberOutlets = async (memberId: string, outletIds: string[]) => {
    try {
      // Delete existing outlets
      await supabase
        .from('team_member_outlets')
        .delete()
        .eq('team_member_id', memberId);

      // Insert new outlets
      if (outletIds.length > 0) {
        const outletInserts = outletIds.map(outletId => ({
          team_member_id: memberId,
          outlet_id: outletId
        }));

        const { error } = await supabase
          .from('team_member_outlets')
          .insert(outletInserts);

        if (error) throw error;
      }

      toast.success("PDV mis à jour", { description: "Les points de vente assignés ont été modifiés" });

      await fetchTeamMembers();
    } catch (error: any) {
      console.error('Error updating member outlets:', error);
      toast.error("Erreur", { description: "Impossible de mettre à jour les PDV" });
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
    updateMemberOutlets,
    canAddMoreMembers,
    getTeamLimit,
    refetch: fetchTeamMembers
  };
};
