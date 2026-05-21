import { createServerClient } from "@supabase/ssr";
import type { CookieOptions } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";
import nodeFetch from "@supabase/node-fetch";
import { cookies } from "next/headers";
import { env, serverEnv } from "@/lib/env";
import type { Database } from "@/lib/types";

type CookieToSet = {
  name: string;
  value: string;
  options: CookieOptions;
};

const serverFetch = nodeFetch as unknown as typeof fetch;

export function createSupabaseServerClient() {
  const cookieStore = cookies();

  return createServerClient<Database>(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
    {
      global: {
        fetch: serverFetch
      },
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet: CookieToSet[]) {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        }
      }
    }
  );
}

export function createSupabaseAdminClient() {
  const config = serverEnv();

  return createClient<Database>(
    config.NEXT_PUBLIC_SUPABASE_URL,
    config.SUPABASE_SECRET_KEY,
    {
      global: {
        fetch: serverFetch
      },
      auth: {
        persistSession: false,
        autoRefreshToken: false
      }
    }
  );
}
