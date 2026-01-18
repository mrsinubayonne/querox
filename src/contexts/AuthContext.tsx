import { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { storeAuthData, getAuthData, clearAuthData } from '@/lib/offlineStorage';
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

  // Load cached auth data for offline mode
  useEffect(() => {
    const loadOfflineAuth = async () => {
      if (!navigator.onLine) {
        const cachedAuth = await getAuthData();
        if (cachedAuth && cachedAuth.user) {
          console.log('📱 Loading cached auth for offline mode');
          setUser(cachedAuth.user as unknown as User);
          setIsOfflineMode(true);
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
        setSession(session);
        setUser(session?.user ?? null);
        setIsOfflineMode(false);
        
        // Only set loading to false if not a team member
        if (!hasTeamSession) {
          setLoading(false);
        }
        
        // Store auth data for offline use when user signs in
        if (event === 'SIGNED_IN' && session?.user) {
          const outletId = localStorage.getItem('selectedOutletId') || undefined;
          
          // Store auth in IndexedDB
          storeAuthData({
            user: session.user as unknown as Record<string, unknown>,
            accessToken: session.access_token,
            refreshToken: session.refresh_token,
          });
          
          // Preload critical data for offline use (deferred)
          setTimeout(() => {
            preloadCriticalData(session.user.id, outletId);
          }, 0);
        }
        
        // Auto-refresh token when it's about to expire
        if (event === 'TOKEN_REFRESHED') {
          console.log('Token refreshed successfully');
          // Update stored auth data
          if (session) {
            storeAuthData({
              user: session.user as unknown as Record<string, unknown>,
              accessToken: session.access_token,
              refreshToken: session.refresh_token,
            });
          }
        }
        
        // Handle signed out event
        if (event === 'SIGNED_OUT') {
          localStorage.clear();
          clearAuthData();
          setIsTeamMember(false);
          setTeamMemberSession(null);
          setIsOfflineMode(false);
        }
      }
    );

    // Check for existing Supabase session only if not a team member
    if (!hasTeamSession) {
      supabase.auth.getSession().then(({ data: { session } }) => {
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
