import "server-only";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

// Module-level singleton, mirroring the cachedToken pattern in lib/ebay.ts —
// reuses one client instead of re-creating it on every request.
let client: SupabaseClient | null = null;

// Server-only admin client using the service-role key, which bypasses Row
// Level Security. Callers are responsible for scoping every query to the
// authenticated user (see lib/cards-db.ts) — this client trusts its caller.
export function getSupabaseAdmin(): SupabaseClient {
  if (client) return client;

  const url = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceRoleKey) {
    throw new Error(
      "Missing SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY environment variables."
    );
  }

  client = createClient(url, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return client;
}
