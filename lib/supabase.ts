import { createClient, type SupabaseClient } from "@supabase/supabase-js";

function publicCredentials() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  return url && key ? { url, key } : null;
}

export function isSupabaseConfigured() {
  return Boolean(publicCredentials());
}

export function createPublicSupabase(): SupabaseClient | null {
  const credentials = publicCredentials();
  if (!credentials) return null;
  return createClient(credentials.url, credentials.key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export function createServiceSupabase(): SupabaseClient | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
