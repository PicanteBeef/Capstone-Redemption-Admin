import { createClient } from '@supabase/supabase-js';

// Admin DB
const supabaseAdminUrl = import.meta.env.VITE_SUPABASE_URL_ADMIN;
const supabaseAdminKey = import.meta.env.VITE_SUPABASE_ANON_KEY_ADMIN;

export const supabase = createClient(supabaseAdminUrl, supabaseAdminKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
});

// Clear any stale sessions on app initialization
supabase.auth.onAuthStateChange((event, session) => {
  if (event === 'SIGNED_OUT') {
    console.log('User signed out. Clearing session...');
  }
});

// Public DB
const supabasePublicUrl = import.meta.env.VITE_SUPABASE_URL_PUBLIC;
const supabasePublicKey = import.meta.env.VITE_SUPABASE_ANON_KEY_PUBLIC;

export const supabasePublic = createClient(supabasePublicUrl, supabasePublicKey);