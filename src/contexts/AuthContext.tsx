import { createContext, useContext, useEffect, useRef, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { storeAuthData, getAuthData, clearAuthData } from '@/lib/offlineStorage';
import { getSelectedOutletIdFromStorage } from '@/lib/offlineIdentity';
import { preloadCriticalData } from '@/hooks/useOfflineData';
import { localStore } from '@/lib/localStore';

const TEAM_MEMBER_TTL_MS = 7 * 24 * 60 * 60 * 1000;

interface TeamMemberSession {
  memberId: string;
  ownerId: string;
  memberEmail: string;
  role: string;
  outletId?: string | null;
  outletIds?: string[];
  expiresAt: string;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  isTeamMember: boolean;
  teamMemberSession: TeamMemberSession | null;
  isOfflineMode: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signUp: (email: string, password: string, fullName?: string, metadata?: any) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const normalizeTeamMemberSession = (raw: TeamMemberSession): TeamMemberSession => {
  const outletIds = Array.isArray(raw.outletIds) ? raw.outletIds.filter(Boolean) : [];
  const outletId = raw.outletId || outletIds[0] || null;
  const normalized = {
    ...raw,
    outletId,
    outletIds: outletIds.length ? outletIds : (outletId ? [outletId] : []),
  };

  if (outletId) {
    localStorage.setItem('selectedOutletId', outletId);
    window.dispatchEvent(new CustomEvent('selected-outlet-changed', { detail: outletId }));
  } else {
    localStorage.removeItem('selectedOutletId');
    window.dispatchEvent(new CustomEvent('selected-outlet-changed', { detail: null }));
  }

  return normalized;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Helper to initialize team member state synchronously from localStorage
const getInitialTeamMemberState = () => {
  const parsed = localStore.raw.getWithTTL<TeamMemberSession | null>('teamMember', null);
  if (parsed && parsed.memberId) {
    console.log('✅ Team member session loaded synchronously on init');
    return { isTeamMember: true, session: normalizeTeamMemberSession(parsed) };
  }
  if (!parsed) {
    localStore.raw.remove('teamMember');
  }
  return { isTeamMember: false, session: null };
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const initialState = getInitialTeamMemberState();
  const OFFLINE_AUTH_MAX_AGE = 7 * 24 * 60 * 60 * 1000;
  const FORCE_OFFLINE_MODE_KEY = 'querox_force_offline_mode';
  
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(!initialState.isTeamMember);
  const [isTeamMember, setIsTeamMember] = useState(initialState.isTeamMember);
  const [teamMemberSession, setTeamMemberSession] = useState<TeamMemberSession | null>(initialState.session);
  const [isOfflineMode, setIsOfflineMode] = useState(false);

  // Track whether we've restored cached auth (so Supabase INITIAL_SESSION doesn't wipe it when offline)
  const offlineAuthLoadedRef = useRef(false);
  const offlineAuthCheckDoneRef = useRef(false);
  const explicitSignOutRef = useRef(false);
  const preloadTriggeredRef = useRef(false);

  const setForcedOfflineMode = (enabled: boolean) => {
    try {
      if (enabled) {
        localStorage.setItem(FORCE_OFFLINE_MODE_KEY, '1');
      } else {
        localStorage.removeItem(FORCE_OFFLINE_MODE_KEY);
      }
      window.dispatchEvent(new CustomEvent('querox-force-offline-mode-changed'));
    } catch (error) {
      console.warn('⚠️ Impossible de mettre à jour le mode hors ligne forcé:', error);
    }
  };

  const restoreCachedAuth = async (reason: string): Promise<boolean> => {
    try {
      const cachedAuth = await getAuthData();
      const cachedAge = cachedAuth?.cachedAt ? Date.now() - cachedAuth.cachedAt : 0;
      const isUsable = !!cachedAuth?.user && (!cachedAuth.cachedAt || cachedAge <= OFFLINE_AUTH_MAX_AGE);

      if (!isUsable) {
        if (cachedAuth?.cachedAt && cachedAge > OFFLINE_AUTH_MAX_AGE) {
          console.warn(`⚠️ Cache auth ignoré (${reason}) : trop ancien`);
        }
        return false;
      }

      // CRITIQUE: ne restaurer l'utilisateur depuis le cache QUE si on est réellement hors-ligne.
      // Si on est en ligne sans session Supabase, restaurer setUser() ferait croire à l'app
      // que l'utilisateur est authentifié alors qu'aucun JWT n'est envoyé aux requêtes Supabase,
      // ce qui provoque des erreurs RLS sur toutes les écritures (création outlet, menu, etc.).
      const browserOffline = typeof navigator !== 'undefined' && !navigator.onLine;

      if (!browserOffline) {
        console.log(`🌐 Cache auth disponible mais en ligne (${reason}) : on laisse Supabase gérer la session`);
        return false;
      }

      console.log(`📱 Restauration de la session locale (${reason}) [offline]`);
      setUser(cachedAuth.user as unknown as User);
      setSession(null);
      setIsOfflineMode(true);
      setForcedOfflineMode(true);
      setLoading(false);
      offlineAuthLoadedRef.current = true;
      return true;
    } catch (error) {
      console.warn(`⚠️ Impossible de restaurer la session locale (${reason}):`, error);
      return false;
    }
  };

  const persistAuthCache = (nextSession: Session) => {
    void storeAuthData({
      user: nextSession.user as unknown as Record<string, unknown>,
      userId: nextSession.user.id,
      email: nextSession.user.email,
      accessToken: nextSession.access_token,
      refreshToken: nextSession.refresh_token,
      expiresAt: nextSession.expires_at,
      userMetadata: (nextSession.user.user_metadata || {}) as Record<string, unknown>,
      cachedAt: Date.now(),
    });
  };

  const resolveOutletIdForPreload = async (userId: string): Promise<string | undefined> => {
    const cachedOutletId = getSelectedOutletIdFromStorage();
    if (cachedOutletId) return cachedOutletId;

    try {
      const selectedProfileId = localStorage.getItem('selectedProfileId');

      if (selectedProfileId) {
        const { data } = await supabase
          .from('user_profiles')
          .select('selected_outlet_id')
          .eq('id', selectedProfileId)
          .maybeSingle();

        const profileOutletId = data?.selected_outlet_id ?? undefined;
        if (profileOutletId) {
          localStorage.setItem('selectedOutletId', profileOutletId);
          return profileOutletId;
        }
      }

      const { data: profileData } = await supabase
        .from('user_profiles')
        .select('selected_outlet_id')
        .eq('user_id', userId)
        .maybeSingle();

      const profileOutletId = profileData?.selected_outlet_id ?? undefined;
      if (profileOutletId) {
        localStorage.setItem('selectedOutletId', profileOutletId);
        return profileOutletId;
      }

      const { data: outlets } = await supabase
        .from('outlets')
        .select('id')
        .eq('user_id', userId)
        .order('created_at', { ascending: true })
        .limit(1);

      const fallbackOutletId = outlets?.[0]?.id;
      if (fallbackOutletId) {
        localStorage.setItem('selectedOutletId', fallbackOutletId);
      }

      return fallbackOutletId;
    } catch (error) {
      console.warn('⚠️ [Offline] Impossible de résoudre outletId pour le preload:', error);
      return undefined;
    }
  };

  const triggerPreloadOnce = (userId: string) => {
    if (!userId) return;
    if (!navigator.onLine) return;
    if (preloadTriggeredRef.current) return;
    preloadTriggeredRef.current = true;

    void resolveOutletIdForPreload(userId)
      .then((outletId) => preloadCriticalData(userId, outletId))
      .then(() => {
        console.log('✅ [Offline] Preload critique terminé');
      })
      .catch(err => {
        console.warn('⚠️ [Offline] Erreur preload:', err);
      });
  };

  // Re-preload when coming back online (using a ref to avoid stale closure)
  const userIdRef = useRef<string | undefined>(undefined);
  useEffect(() => {
    userIdRef.current = user?.id;
  }, [user?.id]);

  useEffect(() => {
    const handleOnline = () => {
      const userId = userIdRef.current;
      if (userId) {
        preloadTriggeredRef.current = false;
        triggerPreloadOnce(userId);
      }
    };
    window.addEventListener('online', handleOnline);
    return () => window.removeEventListener('online', handleOnline);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Load cached auth data for offline mode
  useEffect(() => {
    const loadOfflineAuth = async () => {
      try {
        const hasForcedOfflineMode = typeof window !== 'undefined' && localStorage.getItem(FORCE_OFFLINE_MODE_KEY) === '1';

        if (!navigator.onLine || hasForcedOfflineMode) {
          // Si on est en ligne mais que le flag est resté actif, on le nettoie.
          if (navigator.onLine && hasForcedOfflineMode) {
            console.log('🌐 Connexion détectée au démarrage : désactivation du mode hors-ligne forcé');
            setForcedOfflineMode(false);
            setIsOfflineMode(false);
            await restoreCachedAuth('startup-online-cleanup');
          } else {
            await restoreCachedAuth(hasForcedOfflineMode ? 'startup-forced-offline' : 'startup-offline');
          }
        } else {
          const restored = await restoreCachedAuth('startup-cache-check');
          if (restored) {
            console.log('📦 Session locale détectée au démarrage, accès hors ligne conservé');
          }
        }
      } finally {
        offlineAuthCheckDoneRef.current = true;
        if (!navigator.onLine || offlineAuthLoadedRef.current) {
          setLoading(false);
        }
      }
    };
    loadOfflineAuth();
  }, []);

  useEffect(() => {
    // Check for team member session in localStorage (TTL handled by localStore)
    const checkTeamMemberSession = () => {
      const parsed = localStore.raw.getWithTTL<TeamMemberSession | null>('teamMember', null);
      if (parsed && parsed.memberId) {
        console.log('✅ Team member session found and valid');
        const normalizedSession = normalizeTeamMemberSession(parsed);
        localStore.raw.setWithTTL('teamMember', normalizedSession, TEAM_MEMBER_TTL_MS);
        setIsTeamMember(true);
        setTeamMemberSession(normalizedSession);
        setLoading(false);
        return true;
      }
      if (!parsed) {
        localStore.raw.remove('teamMember');
      }
      return false;
    };

    const handleTeamMemberSessionUpdated = () => {
      if (!checkTeamMemberSession()) {
        setIsTeamMember(false);
        setTeamMemberSession(null);
      }
    };

    window.addEventListener('team-member-session-updated', handleTeamMemberSessionUpdated);

    // Check team member session first
    const hasTeamSession = checkTeamMemberSession();
    
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log('Auth event:', event);

        const currentlyOffline = !navigator.onLine;

        // If we're offline and still checking cached auth, don't process null-session events yet.
        // Otherwise the app can redirect to /auth before cached user is restored.
        if (currentlyOffline && !offlineAuthCheckDoneRef.current && !session) {
          console.log('📴 Offline: waiting for cached auth before processing auth event:', event);
          return;
        }

        // If we already restored cached auth for offline use, don't let a null session wipe it out.
        // This typically happens on INITIAL_SESSION when offline.
        if (currentlyOffline && offlineAuthLoadedRef.current && !session) {
          // If the user explicitly signed out, we allow the normal SIGNED_OUT behavior.
          if (!(event === 'SIGNED_OUT' && explicitSignOutRef.current)) {
            console.log('📴 Offline mode: ignoring auth event that would clear user:', event);
            setIsOfflineMode(true);
            setLoading(false);
            return;
          }
        }

        if (session?.user) {
          setSession(session);
          setUser(session.user);
          setForcedOfflineMode(false);
        } else if (event === 'SIGNED_OUT' && explicitSignOutRef.current) {
          setSession(null);
          setUser(null);
        }

        if (navigator.onLine) {
          setIsOfflineMode(false);
        }
        
        // Only set loading to false if not a team member
        if (!hasTeamSession) {
          setLoading(false);
        }
        
        // Store auth data for offline use when user signs in
        if (event === 'SIGNED_IN' && session?.user) {
          persistAuthCache(session);
          setForcedOfflineMode(false);

          // Preload critical data for offline use
          triggerPreloadOnce(session.user.id);
        }
        
        // Auto-refresh token when it's about to expire
        if (event === 'TOKEN_REFRESHED') {
          console.log('Token refreshed successfully');
          // Update stored auth data
          if (session) {
            persistAuthCache(session);
            setForcedOfflineMode(false);

            // Ensure we preload at least once even if user never hits SIGNED_IN in this tab
            triggerPreloadOnce(session.user.id);
          }
        }
        
        // Handle signed out event
        if (event === 'SIGNED_OUT') {
          // IMPORTANT: only wipe local app state on explicit/manual sign out.
          // Supabase can emit SIGNED_OUT during token edge-cases; we keep offline continuity.
          if (explicitSignOutRef.current) {
            localStorage.clear();
            clearAuthData();
            setIsTeamMember(false);
            setTeamMemberSession(null);
            setIsOfflineMode(false);
            setForcedOfflineMode(false);

            // Reset refs
            offlineAuthLoadedRef.current = false;
            explicitSignOutRef.current = false;
            preloadTriggeredRef.current = false;
            return;
          }

          // Unexpected SIGNED_OUT: try to keep user in offline mode using cached auth
          void restoreCachedAuth('unexpected-signed-out').then((restored) => {
            if (restored) return;

            // No cache available → fallback to logged-out state
            setUser(null);
            setSession(null);
            setIsOfflineMode(false);
            setForcedOfflineMode(false);
            setIsTeamMember(false);
            setTeamMemberSession(null);
          });
        }

        if (event === 'INITIAL_SESSION' && !session && !explicitSignOutRef.current) {
          void restoreCachedAuth('initial-session-null');
        }
      }
    );

    // Check for existing Supabase session only if not a team member
    if (!hasTeamSession && navigator.onLine) {
      supabase.auth.getSession().then(async ({ data: { session } }) => {
        // If offline auth is already restored, don't wipe it out with a null session.
        if (!navigator.onLine && offlineAuthLoadedRef.current && !session) {
          setIsOfflineMode(true);
          setLoading(false);
          return;
        }

        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
        
        // Store for offline if we have a session
        if (session?.user) {
          setForcedOfflineMode(false);
          persistAuthCache(session);

          // IMPORTANT: when the user is already signed in, SIGNED_IN might not fire.
          // We still need to preload critical tables at least once while online.
          triggerPreloadOnce(session.user.id);
        } else if (!explicitSignOutRef.current) {
          const restored = await restoreCachedAuth('get-session-null');
          if (!restored) {
            setForcedOfflineMode(false);
          }
        }
      });
    }

    return () => {
      subscription.unsubscribe();
      window.removeEventListener('team-member-session-updated', handleTeamMemberSessionUpdated);
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    const normalizedEmail = email.trim().toLowerCase();

    const { error } = await supabase.auth.signInWithPassword({
      email: normalizedEmail,
      password,
    });

    return { error };
  };

  const signUp = async (email: string, password: string, fullName?: string, metadata?: any) => {
    const normalizedEmail = email.trim().toLowerCase();
    const redirectUrl = `${window.location.origin}/`;

    const { error } = await supabase.auth.signUp({
      email: normalizedEmail,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: {
          full_name: fullName,
          ...metadata,
        },
      },
    });

    return { error };
  };

  const signOut = async () => {
    explicitSignOutRef.current = true;
    // Clear all localStorage data before signing out
    localStorage.clear();
    setForcedOfflineMode(false);
    await clearAuthData();
    setIsTeamMember(false);
    setTeamMemberSession(null);
    setIsOfflineMode(false);
    await supabase.auth.signOut();
  };

  const value = {
    user,
    session,
    loading,
    isTeamMember,
    teamMemberSession,
    isOfflineMode,
    signIn,
    signUp,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
