import { createClient } from "@supabase/supabase-js";
import { createServiceSupabase } from "@/lib/supabase";

export async function requireAdmin(request: Request) {
  const authorization = request.headers.get("authorization");
  const token = authorization?.startsWith("Bearer ") ? authorization.slice(7) : "";
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const service = createServiceSupabase();
  if (!token || !url || !key || !service) return null;

  const authClient = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
  const { data: { user }, error } = await authClient.auth.getUser(token);
  if (error || !user) return null;

  const { data: profile } = await service.from("profiles").select("id, role, display_name").eq("id", user.id).maybeSingle();
  if (!profile || !["admin", "editor"].includes(profile.role)) return null;
  return { user, profile, service };
}
