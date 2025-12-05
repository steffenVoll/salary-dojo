import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  credits: number;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<{ error: string | null }>;
  signUpWithEmail: (email: string, password: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  refreshCredits: () => Promise<void>;
  deductCredit: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [credits, setCredits] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchCredits = async (userId: string) => {
    const { data } = await supabase
      .from('user_credits')
      .select('credits')
      .eq('user_id', userId)
      .maybeSingle();
    
    if (data) {
      setCredits(data.credits);
    }
  };

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          setTimeout(() => {
            fetchCredits(session.user.id);
          }, 0);
        } else {
          setCredits(0);
        }
        setLoading(false);
      }
    );

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchCredits(session.user.id);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signInWithGoogle = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/`,
      },
    });
  };

  const signInWithEmail = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error: error?.message ?? null };
  };

  const signUpWithEmail = async (email: string, password: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/`,
      },
    });
    return { error: error?.message ?? null };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    setCredits(0);
  };

  const refreshCredits = async () => {
    if (user) {
      await fetchCredits(user.id);
    }
  };

  const deductCredit = async (): Promise<boolean> => {
    if (!user || credits <= 0) return false;
    
    const { error } = await supabase
      .from('user_credits')
      .update({ credits: credits - 1 })
      .eq('user_id', user.id);
    
    if (!error) {
      setCredits(prev => prev - 1);
      return true;
    }
    return false;
  };

  return (
    <AuthContext.Provider value={{
      user,
      session,
      credits,
      loading,
      signInWithGoogle,
      signInWithEmail,
      signUpWithEmail,
      signOut,
      refreshCredits,
      deductCredit,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
