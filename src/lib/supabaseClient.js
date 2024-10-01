import { createClient } from '@supabase/supabase-js';

// Admin DB
const supabaseAdminUrl = import.meta.env.VITE_SUPABASE_URL_ADMIN;
const supabaseAdminKey = import.meta.env.VITE_SUPABASE_ANON_KEY_ADMIN;

export const supabase = createClient(supabaseAdminUrl, supabaseAdminKey);

// Public DB
const supabasePublicUrl = import.meta.env.VITE_SUPABASE_URL_PUBLIC;
const supabasePublicKey = import.meta.env.VITE_SUPABASE_ANON_KEY_PUBLIC;

export const supabasePublic = createClient(supabasePublicUrl, supabasePublicKey);