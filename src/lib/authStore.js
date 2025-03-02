// src/lib/authStore.js
import { writable } from 'svelte/store';
import { supabase } from '$lib/supabaseClient';

export const authStore = writable({
  user: null,
  isAuthenticated: false,
});

// Listen for authentication state changes
supabase.auth.onAuthStateChange((event, session) => {
  console.log('Auth state changed:', { event, session });
  authStore.update((state) => ({
    ...state,
    user: session?.user || null,
    isAuthenticated: !!session,
  }));
});