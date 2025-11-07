import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface TeamMemberSession {
  memberId: string;
  ownerId: string;
  role: string;
  email: string;
}

const ROLE_PERMISSIONS: Record<string, string[]> = {
  'manager': [
    'view_dashboard',
    'manage_orders',
    'manage_reservations',
    'manage_menu',
    'manage_customers',
    'view_analytics',
    'manage_inventory',
    'manage_invoices'
  ],
  'serveur': [
    'view_dashboard',
    'manage_orders',
    'manage_reservations',
    'view_menu',
    'manage_customers'
  ],
  'caissier': [
    'view_dashboard',
    'manage_orders',
    'view_menu',
    'manage_invoices',
    'view_analytics'
  ],
  'cuisinier': [
    'view_dashboard',
    'view_orders',
    'view_menu'
  ],
  'livreur': [
    'view_dashboard',
    'view_orders',
    'view_customers'
  ]
};

export const useTeamPermissions = () => {
  const [permissions, setPermissions] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [teamMember, setTeamMember] = useState<TeamMemberSession | null>(null);

  useEffect(() => {
    loadPermissions();
  }, []);

  const loadPermissions = async () => {
    try {
      const teamMemberStr = localStorage.getItem('teamMember') || localStorage.getItem('team_member_session');
      if (!teamMemberStr) {
        setPermissions([]);
        setLoading(false);
        return;
      }

      const member: TeamMemberSession = JSON.parse(teamMemberStr);
      setTeamMember(member);

      // Get permissions from database for this role
      const { data, error } = await supabase
        .rpc('get_role_permissions', {
          _role_name: member.role
        });

      if (error) throw error;

      if (data && data.length > 0) {
        const dbPermissions = data.map((p: any) => p.permission_name);
        setPermissions(dbPermissions);
      } else {
        // Fallback to predefined permissions
        setPermissions(ROLE_PERMISSIONS[member.role] || []);
      }
    } catch (error) {
      console.error('Error loading permissions:', error);
      // Fallback to predefined permissions
      const teamMemberStr = localStorage.getItem('teamMember') || localStorage.getItem('team_member_session');
      if (teamMemberStr) {
        const member: TeamMemberSession = JSON.parse(teamMemberStr);
        setPermissions(ROLE_PERMISSIONS[member.role] || []);
      }
    } finally {
      setLoading(false);
    }
  };

  const hasPermission = (permission: string): boolean => {
    return permissions.includes(permission);
  };

  const hasAnyPermission = (requiredPermissions: string[]): boolean => {
    return requiredPermissions.some(p => permissions.includes(p));
  };

  const hasAllPermissions = (requiredPermissions: string[]): boolean => {
    return requiredPermissions.every(p => permissions.includes(p));
  };

  const isTeamMember = (): boolean => {
    // Vérifier qu'il y a bien un teamMember dans le state
    // ET que ce n'est pas juste des données corrompues dans localStorage
    if (!teamMember) return false;
    
    // S'assurer que les données sont valides (memberId et ownerId existent)
    return !!(teamMember.memberId && teamMember.ownerId);
  };

  const logActivity = async (actionType: string, description: string, entityType?: string, entityId?: string) => {
    if (!teamMember) return;

    try {
      await supabase
        .from('team_activity_logs')
        .insert({
          team_member_id: teamMember.memberId,
          action_type: actionType,
          action_description: description,
          entity_type: entityType,
          entity_id: entityId
        });

      // Increment actions count
      const { data: currentMember } = await supabase
        .from('team_members')
        .select('actions_count')
        .eq('id', teamMember.memberId)
        .single();

      if (currentMember) {
        await supabase
          .from('team_members')
          .update({ actions_count: (currentMember.actions_count || 0) + 1 })
          .eq('id', teamMember.memberId);
      }
    } catch (error) {
      console.error('Error logging activity:', error);
    }
  };

  return {
    permissions,
    loading,
    teamMember,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    isTeamMember,
    logActivity
  };
};
