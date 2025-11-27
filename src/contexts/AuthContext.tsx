import { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

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
        
        // Only set loading to false if not a team member
        if (!hasTeamSession) {
          setLoading(false);
        }
        
        // Auto-refresh token when it's about to expire
        if (event === 'TOKEN_REFRESHED') {
          console.log('Token refreshed successfully');
        }
        
        // Handle signed out event
        if (event === 'SIGNED_OUT') {
          localStorage.clear(); // Clear all local data on sign out
          setIsTeamMember(false);
          setTeamMemberSession(null);
        }
      }
    );

    // Check for existing Supabase session only if not a team member
    if (!hasTeamSession) {
      supabase.auth.getSession().then(({ data: { session } }) => {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
      });
    }

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
    setIsTeamMember(false);
    setTeamMemberSession(null);
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
