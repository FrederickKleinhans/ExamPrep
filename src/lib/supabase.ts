import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    '[CertArc] Supabase environment variables not set. ' +
    'Auth and progress sync will be unavailable. ' +
    'Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to your .env.local file.',
  );
}

// createClient is safe to call with empty strings — all auth/sync calls
// will fail gracefully and fall back to localStorage-only mode.
export const supabase = createClient(
  supabaseUrl ?? '',
  supabaseAnonKey ?? '',
);

/** True when Supabase is configured and available. */
export const isSupabaseConfigured =
  Boolean(supabaseUrl) && Boolean(supabaseAnonKey);
