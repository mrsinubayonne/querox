import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

type OutletRole = 'proprietaire' | 'superviseur' | 'comptable' | 'caissier';

interface Permission {
  dashboard: boolean;
  orders: boolean;
  reservations: boolean;
  menus: boolean;
  inventory: boolean;
  invoices: boolean;
  accounting: boolean;
  statistics: boolean;
  customers: boolean;
  events: boolean;
  qrcodes: boolean;
  settings: boolean;
  team: boolean;
  // Accessible to all
  website: boolean;
  marketing: boolean;
  staff_request: boolean;
  support: boolean;
}

const ROLE_PERMISSIONS: Record<OutletRole, Permission> = {
  proprietaire: {
    dashboard: true,
    orders: true,
    reservations: true,
    menus: true,
    inventory: true,
    invoices: true,
    accounting: true,
    statistics: true,
    customers: true,
    events: true,
    qrcodes: true,
    settings: true,
    team: true,
    website: true,
    marketing: true,
    staff_request: true,
    support: true,
  },
  superviseur: {
    dashboard: true,
    orders: true,
    reservations: true,
    menus: true,
    inventory: true,
    invoices: true,
    accounting: true,
    statistics: true,
    customers: true,
    events: true,
    qrcodes: true,
    settings: false, // Superviseur n'a pas accès aux paramètres
    team: true,
    website: true,
    marketing: true,
    staff_request: true,
    support: true,
  },
  comptable: {
    dashboard: true,
    orders: false,
    reservations: false,
    menus: false,
    inventory: true,
    invoices: true,
    accounting: true,
    statistics: true,
    customers: false,
    events: false,
    qrcodes: false,
    settings: false,
    team: false,
    website: true,
    marketing: true,
    staff_request: true,
    support: true,
  },
  caissier: {
    dashboard: true,
    orders: true,
    reservations: true,
    menus: false,
    inventory: true,
    invoices: true,
    accounting: false,
    statistics: false,
    customers: false,
    events: false,
    qrcodes: false,
    settings: false,
    team: false,
    website: true,
    marketing: true,
    staff_request: true,
    support: true,
  },
};

export const useOutletRole = (outletId?: string) => {
  const { user } = useAuth();
  const [role, setRole] = useState<OutletRole | null>(null);
  const [loading, setLoading] = useState(true);
  const [permissions, setPermissions] = useState<Permission>(ROLE_PERMISSIONS.proprietaire);

  useEffect(() => {
    const loadRole = async () => {
      if (!user || !outletId) {
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('outlet_user_roles')
          .select('role')
          .eq('outlet_id', outletId)
          .eq('user_id', user.id)
          .single();

        if (error) throw error;

        const userRole = data?.role as OutletRole;
        setRole(userRole);
        setPermissions(ROLE_PERMISSIONS[userRole] || ROLE_PERMISSIONS.proprietaire);
      } catch (error) {
        console.error('Error loading outlet role:', error);
        // Default to proprietaire if error
        setRole('proprietaire');
        setPermissions(ROLE_PERMISSIONS.proprietaire);
      } finally {
        setLoading(false);
      }
    };

    loadRole();
  }, [user, outletId]);

  const hasPermission = (permission: keyof Permission): boolean => {
    return permissions[permission];
  };

  return {
    role,
    loading,
    permissions,
    hasPermission,
  };
};
