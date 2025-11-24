import { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

interface TeamMemberSession {
  memberId: string;
  ownerId: string;
  memberEmail: string;
  role: string;
  outletId?: string;
  expiresAt: string;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  isTeamMember: boolean;
  teamMemberSession: TeamMemberSession | null;
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

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [isTeamMember, setIsTeamMember] = useState(false);
  const [teamMemberSession, setTeamMemberSession] = useState<TeamMemberSession | null>(null);

  // Check for team member session
  useEffect(() => {
    const checkTeamMemberSession = () => {
      const teamMemberData = localStorage.getItem('teamMember');
      if (teamMemberData) {
        try {
          const parsedData = JSON.parse(teamMemberData);
          const expiresAt = new Date(parsedData.expiresAt);
          
          if (expiresAt > new Date()) {
            setIsTeamMember(true);
            setTeamMemberSession(parsedData);
          } else {
            // Session expired
            localStorage.removeItem('teamMember');
            setIsTeamMember(false);
            setTeamMemberSession(null);
          }
        } catch (error) {
          console.error('Error parsing team member session:', error);
          setIsTeamMember(false);
          setTeamMemberSession(null);
        }
      } else {
        setIsTeamMember(false);
        setTeamMemberSession(null);
      }
    };

    checkTeamMemberSession();
    
    // Listen for localStorage changes
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'teamMember') {
        checkTeamMemberSession();
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log('Auth event:', event);
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
        
        // Auto-refresh token when it's about to expire
        if (event === 'TOKEN_REFRESHED') {
          console.log('Token refreshed successfully');
        }
        
        // Handle signed out event
        if (event === 'SIGNED_OUT') {
          localStorage.clear(); // Clear all local data on sign out
        }
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { error };
  };

  const signUp = async (email: string, password: string, fullName?: string, metadata?: any) => {
    const redirectUrl = `${window.location.origin}/`;
    
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: {
          full_name: fullName,
          ...metadata
        }
      }
    });
    return { error };
  };

  const signOut = async () => {
    // Clear all localStorage data before signing out
    localStorage.clear();
    await supabase.auth.signOut();
  };

  const value = {
    user,
    session,
    loading,
    isTeamMember,
    teamMemberSession,
    signIn,
    signUp,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
