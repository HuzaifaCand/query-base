import { createServerClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import { Database } from "@/lib/databasetypes";

/**
 * Creates an authenticated Supabase server client for use in API routes.
 *
 * Reads the user's session from the incoming request cookies (forwarded
 * automatically by the browser), so queries run in the authenticated user's
 * context and RLS policies apply correctly — no service role key needed.
 */
export async function createApiClient() {
  const cookieStore = await cookies();

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          // Setting cookies in a read-only context (API route) is a no-op.
          // The client only needs to read the session, not refresh it here.
        },
      },
    },
  );
}

/**
 * Creates a Supabase client with the service-role key.
 *
 * Use this ONLY in trusted server-side API routes (e.g. email notification
 * handlers) where there is no user session available but you still need to
 * read data across RLS boundaries. Never expose this client to the browser.
 */
export function createServiceClient() {
  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );
}
