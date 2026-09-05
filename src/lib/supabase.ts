import { createClient } from "@supabase/supabase-js";

/**
 * Server-only Supabase client.
 *
 * This module is imported exclusively by route handlers under src/app/api, so
 * the key never reaches the browser. The key is a Supabase *secret* key, which
 * bypasses Row Level Security - it must never be given a NEXT_PUBLIC_ prefix,
 * because Next.js inlines any NEXT_PUBLIC_ variable into client bundles.
 *
 * NEXT_PUBLIC_SUPABASE_ANON_KEY is still read as a fallback so the deployed
 * site keeps working until the Vercel environment variable is renamed. Remove
 * that fallback once SUPABASE_SECRET_KEY is set in Vercel.
 */

const supabaseUrl =
  process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || "";

const supabaseKey =
  process.env.SUPABASE_SECRET_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

export const supabase =
  supabaseUrl && supabaseKey
    ? createClient(supabaseUrl, supabaseKey, {
        auth: { persistSession: false, autoRefreshToken: false },
      })
    : (null as unknown as ReturnType<typeof createClient>);
