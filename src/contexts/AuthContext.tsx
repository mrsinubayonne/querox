import { createContext, useContext, useEffect, useRef, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { storeAuthData, getAuthData, clearAuthData } from '@/lib/offlineStorage';
import { getSelectedOutletIdFromStorage } from '@/lib/offlineIdentity';
import { preloadCriticalData } from '@/hooks/useOfflineData';

interface TeamMemberSession {
  memberId: string;
  ownerId: string;
  memberEmail: string;
  role: string;
  outletId: string;
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

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Helper to initialize team member state synchronously from localStorage
const getInitialTeamMemberState = () => {
  try {
    const teamMemberData = localStorage.getItem('teamMember');
    if (teamMemberData) {
      const parsed = JSON.parse(teamMemberData);
      const expiresAt = new Date(parsed.expiresAt);
      if (expiresAt > new Date()) {
        console.log('✅ Team member session loaded synchronously on init');
        return { isTeamMember: true, session: parsed };
      }
      localStorage.removeItem('teamMember');
    }
  } catch (error) {
    console.error('Error loading team member session:', error);
    localStorage.removeItem('teamMember');
  }
  return { isTeamMember: false, session: null };
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const initialState = getInitialTeamMemberState();
  
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

  const triggerPreloadOnce = (userId: string) => {
    if (!userId) return;
    if (!navigator.onLine) return;
    if (preloadTriggeredRef.current) return;
    preloadTriggeredRef.current = true;

    const outletId = getSelectedOutletIdFromStorage();
    preloadCriticalData(userId, outletId).then(() => {
      console.log('✅ [Offline] Preload critique terminé');
    }).catch(err => {
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
      if (!navigator.onLine) {
        try {
          const cachedAuth = await getAuthData();
          if (cachedAuth && cachedAuth.user) {
            console.log('📱 Loading cached auth for offline mode');
            setUser(cachedAuth.user as unknown as User);
            setIsOfflineMode(true);
            offlineAuthLoadedRef.current = true;
          }
        } finally {
          offlineAuthCheckDoneRef.current = true;
          setLoading(false);
        }
      }
    };
    loadOfflineAuth();
  }, []);

  useEffect(() => {
    // Check for team member session in localStorage
    const checkTeamMemberSession = () => {
      const teamMemberData = localStorage.getItem('teamMember');
      if (teamMemberData) {
        try {
          const parsed = JSON.parse(teamMemberData);
          const expiresAt = new Date(parsed.expiresAt);
          
          // Check if session is expired
          if (expiresAt > new Date()) {
            console.log('✅ Team member session found and valid');
            setIsTeamMember(true);
            setTeamMemberSession(parsed);
            setLoading(false);
            return true;
          } else {
            console.log('❌ Team member session expired');
            localStorage.removeItem('teamMember');
          }
        } catch (error) {
          console.error('Error parsing team member session:', error);
          localStorage.removeItem('teamMember');
        }
      }
      return false;
    };

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

          // Preload critical data for offline use
          triggerPreloadOnce(session.user.id);
        }
        
        // Auto-refresh token when it's about to expire
        if (event === 'TOKEN_REFRESHED') {
          console.log('Token refreshed successfully');
          // Update stored auth data
          if (session) {
            persistAuthCache(session);

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

            // Reset refs
            offlineAuthLoadedRef.current = false;
            explicitSignOutRef.current = false;
            preloadTriggeredRef.current = false;
            return;
          }

          // Unexpected SIGNED_OUT: try to keep user in offline mode using cached auth
          void getAuthData().then((cachedAuth) => {
            if (cachedAuth?.user) {
              console.warn('⚠️ SIGNED_OUT non manuel détecté: restauration session locale offline');
              setUser(cachedAuth.user as unknown as User);
              setSession(null);
              setIsOfflineMode(true);
              setLoading(false);
              offlineAuthLoadedRef.current = true;
              return;
            }

            // No cache available → fallback to logged-out state
            setUser(null);
            setSession(null);
            setIsOfflineMode(false);
            setIsTeamMember(false);
            setTeamMemberSession(null);
          });
        }
      }
    );

    // Check for existing Supabase session only if not a team member
    if (!hasTeamSession && navigator.onLine) {
      supabase.auth.getSession().then(({ data: { session } }) => {
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
          storeAuthData({
            user: session.user as unknown as Record<string, unknown>,
            accessToken: session.access_token,
            refreshToken: session.refresh_token,
          });

          // IMPORTANT: when the user is already signed in, SIGNED_IN might not fire.
          // We still need to preload critical tables at least once while online.
          triggerPreloadOnce(session.user.id);
        }
      });
    }

    return () => subscription.unsubscribe();
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
