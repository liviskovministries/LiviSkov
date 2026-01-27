'use client';

import { createContext, useContext, useEffect, useState, useMemo, ReactNode } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

interface SupabaseContextType {
  supabase: typeof supabase;
  session: Session | null;
  user: User | null;
  isUserLoading: boolean;
}

const SupabaseContext = createContext<SupabaseContextType | undefined>(undefined);

export function SupabaseProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isUserLoading, setIsUserLoading] = useState(true);

  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, currentSession) => {
        setSession(currentSession);
        setUser(currentSession?.user || null);
        setIsUserLoading(false);
      }
    );

    // Fetch initial session
    supabase.auth.getSession().then(({ data: { session: initialSession } }) => {
      setSession(initialSession);
      setUser(initialSession?.user || null);
      setIsUserLoading(false);
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const contextValue = useMemo(() => ({
    supabase,
    session,
    user,
    isUserLoading,
  }), [session, user, isUserLoading]);

  return (
    <SupabaseContext.Provider value={contextValue}>
      {children}
    </SupabaseContext.Provider>
  );
}

export const useSupabase = () => {
  const context = useContext(SupabaseContext);
  if (context === undefined) {
    throw new Error('useSupabase must be used within a SupabaseProvider');
  }
  return context;
};

export const useSupabaseAuth = () => {
  const { supabase } = useSupabase();
  return supabase.auth;
};

export const useSupabaseUser = () => {
  const { user, isUserLoading } = useSupabase();
  return { user, isUserLoading };
};