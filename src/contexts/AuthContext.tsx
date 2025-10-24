import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

interface TeamMemberSession {
  memberId: string;
  ownerId: string;
  memberEmail: string;
  role: string;
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
  signOutTeamMember: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [isTeamMember, setIsTeamMember] = useState(false);
  const [teamMemberSession, setTeamMemberSession] = useState<TeamMemberSession | null>(null);

  useEffect(() => {
    // Check for team member session
    const checkTeamMember = () => {
      try {
        const teamMemberData = localStorage.getItem('teamMember');
        if (teamMemberData) {
          const parsedData = JSON.parse(teamMemberData);
          
          // Check expiration
          if (parsedData.expiresAt && new Date(parsedData.expiresAt) > new Date()) {
            setIsTeamMember(true);
            setTeamMemberSession(parsedData);
            setLoading(false);
            return true;
          } else {
            // Session expired
            localStorage.removeItem('teamMember');
            setIsTeamMember(false);
            setTeamMemberSession(null);
          }
        }
      } catch (error) {
        console.error('Error checking team member session:', error);
      }
      return false;
    };

    // Check team member first
    if (checkTeamMember()) {
      return;
    }

    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    // THEN check for existing session
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
    await supabase.auth.signOut();
    setIsTeamMember(false);
    setTeamMemberSession(null);
  };

  const signOutTeamMember = () => {
    localStorage.removeItem('teamMember');
    localStorage.removeItem('team_member_session'); // Legacy
    setIsTeamMember(false);
    setTeamMemberSession(null);
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
    signOutTeamMember,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
