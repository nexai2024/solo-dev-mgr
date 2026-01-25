import { createClient } from "@supabase/supabase-js";

/**
 * Server-side Supabase client. Uses service role key to bypass RLS.
 * Authorization is enforced via Clerk auth checks in server actions (user_id filters).
 * Add SUPABASE_SERVICE_ROLE_KEY to .env (Supabase Dashboard → Settings → API).
 */
export const createSupabaseClient = () => {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
};
