import { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';

type OutletRole = 'proprietaire' | 'superviseur' | 'comptable' | 'caissier';

interface ProfileSession {
  profileId: string;
  outletId: string;
  role: OutletRole;
  profileName: string;
  outletName: string;
  ownerId: string;
  sessionId: string;
  expiresAt: string;
}

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
    settings: false,
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

export const useOutletProfile = () => {
  const [profileSession, setProfileSession] = useState<ProfileSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [permissions, setPermissions] = useState<Permission>(ROLE_PERMISSIONS.proprietaire);

  useEffect(() => {
    loadSession();
    
    // Check session validity every minute
    const interval = setInterval(checkSessionValidity, 60000);
    return () => clearInterval(interval);
  }, []);

  const loadSession = () => {
    try {
      const sessionStr = localStorage.getItem('outletProfile');
      if (sessionStr) {
        const session: ProfileSession = JSON.parse(sessionStr);
        
        // Check expiration
        if (new Date(session.expiresAt) > new Date()) {
          setProfileSession(session);
          setPermissions(ROLE_PERMISSIONS[session.role]);
        } else {
          // Session expired
          logout();
        }
      }
    } catch (error) {
      console.error('Error loading profile session:', error);
      logout();
    } finally {
      setLoading(false);
    }
  };

  const checkSessionValidity = () => {
    const sessionStr = localStorage.getItem('outletProfile');
    if (sessionStr) {
      const session: ProfileSession = JSON.parse(sessionStr);
      if (new Date(session.expiresAt) <= new Date()) {
        logout();
        window.location.href = '/profile-login';
      }
    }
  };

  const login = (sessionData: Omit<ProfileSession, 'sessionId' | 'expiresAt'>) => {
    const sessionId = uuidv4();
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 8); // 8 hours

    const session: ProfileSession = {
      ...sessionData,
      sessionId,
      expiresAt: expiresAt.toISOString()
    };

    localStorage.setItem('outletProfile', JSON.stringify(session));
    setProfileSession(session);
    setPermissions(ROLE_PERMISSIONS[session.role]);
  };

  const logout = () => {
    localStorage.removeItem('outletProfile');
    setProfileSession(null);
    setPermissions(ROLE_PERMISSIONS.proprietaire);
  };

  const hasPermission = (permission: keyof Permission): boolean => {
    return permissions[permission];
  };

  const isProfileAuthenticated = (): boolean => {
    return profileSession !== null;
  };

  return {
    profileSession,
    loading,
    permissions,
    hasPermission,
    isProfileAuthenticated,
    login,
    logout,
  };
};
