import { create } from 'zustand';
import type { Session, User, AuthError } from '@supabase/supabase-js';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

export type AuthProvider = 'google' | 'github';

let authSubscription: { unsubscribe: () => void } | null = null;

interface AuthState {
  session: Session | null;
  user: User | null;
  isLoading: boolean;
  isInitialised: boolean;
  error: string | null;

  // Actions
  initialise: () => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<AuthError | null>;
  signUpWithEmail: (email: string, password: string) => Promise<AuthError | null>;
  signInWithProvider: (provider: AuthProvider) => Promise<AuthError | null>;
  signOut: () => Promise<void>;
  clearError: () => void;
}

export const useAuth = create<AuthState>((set) => ({
  session: null,
  user: null,
  isLoading: false,
  isInitialised: false,
  error: null,

  initialise: async () => {
    if (!isSupabaseConfigured || !supabase) {
      set({ isInitialised: true });
      return;
    }

    set({ isLoading: true });

    // Get current session
    const { data: { session }, error } = await supabase.auth.getSession();
    set({
      session,
      user: session?.user ?? null,
      isLoading: false,
      isInitialised: true,
      error: error?.message ?? null,
    });

    // Listen for auth changes
    authSubscription?.unsubscribe();
    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      set({ session, user: session?.user ?? null });
    });
    authSubscription = data.subscription;
  },

  signInWithEmail: async (email, password) => {
    if (!isSupabaseConfigured || !supabase) return null;
    set({ isLoading: true, error: null });
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    set({ isLoading: false, error: error?.message ?? null });
    return error;
  },

  signUpWithEmail: async (email, password) => {
    if (!isSupabaseConfigured || !supabase) return null;
    set({ isLoading: true, error: null });
    const { error } = await supabase.auth.signUp({ email, password });
    set({ isLoading: false, error: error?.message ?? null });
    return error;
  },

  signInWithProvider: async (provider) => {
    if (!isSupabaseConfigured || !supabase) return null;
    set({ isLoading: true, error: null });
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/`,
      },
    });
    // For OAuth the page redirects away — isLoading stays true until redirect
    if (error) set({ isLoading: false, error: error.message });
    return error;
  },

  signOut: async () => {
    set({ isLoading: true });
    if (!isSupabaseConfigured || !supabase) {
      set({ session: null, user: null, isLoading: false });
      return;
    }

    const { error } = await supabase.auth.signOut();
    set({
      session: null,
      user: null,
      isLoading: false,
      error: error?.message ?? null,
    });
  },

  clearError: () => set({ error: null }),
}));

/** Convenience selector — true when a user is signed in */
export const selectIsSignedIn = (state: AuthState) => state.session !== null;

/** The user's display name, falling back to their email prefix */
export function getUserDisplayName(user: User | null): string {
  if (!user) return 'Guest';
  return (
    user.user_metadata?.full_name as string ??
    user.user_metadata?.name as string ??
    user.email?.split('@')[0] ??
    'User'
  );
}

/** The user's avatar URL from OAuth provider, or null */
export function getUserAvatar(user: User | null): string | null {
  if (!user) return null;
  return (
    user.user_metadata?.avatar_url as string ??
    user.user_metadata?.picture as string ??
    null
  );
}
