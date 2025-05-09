import { useState, useEffect } from 'react';
import { supabase } from '@/services/supabase';
import { Session } from '@supabase/supabase-js';
import { router } from 'expo-router';

export function useAuth() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (mounted) {
        setSession(session);
        setLoading(false);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (mounted) {
        setSession(session);
        setLoading(false);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async ({ email, password }: { email: string; password: string }) => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (!error) {
        // Ensure we wait for the session to be set before redirecting
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      return { error };
    } finally {
      setLoading(false);
    }
  };

  const signUp = async ({ email, password }: { email: string; password: string }) => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.signUp({ email, password });
      return { error };
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.signOut();
      if (!error) {
        router.replace('/');
      }
      return { error };
    } finally {
      setLoading(false);
    }
  };

  return {
    session,
    loading,
    signIn,
    signUp,
    signOut,
    user: session?.user || null,
  };
}