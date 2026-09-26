import { cache } from 'react';
import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'
import '@/utils/dnsOptimizer';

export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch (error) {
          }
        },
      },
    }
  )
}

let publicClientInstance: ReturnType<typeof createSupabaseClient> | null = null;

export function createPublicClient() {
  if (!publicClientInstance) {
    publicClientInstance = createSupabaseClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        auth: { persistSession: false, autoRefreshToken: false },
      }
    );
  }
  return publicClientInstance;
}

let adminClientInstance: any = null;

export function createAdminClient(customUrl?: string, customKey?: string, options?: any): any {
  const serviceKey = customKey || process.env.SUPABASE_SERVICE_ROLE_KEY;
  const url = customUrl || process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!serviceKey || !url) {
    throw new Error('Supabase admin credentials missing');
  }
  if (!adminClientInstance) {
    adminClientInstance = createSupabaseClient(url, serviceKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
  }
  return adminClientInstance as any;
}

export const getCurrentUser = cache(async () => {
  try {
    const cookieStore = await cookies();
    const hasAuthCookie = cookieStore.getAll().some(c => c.name.includes('-auth-token'));
    if (!hasAuthCookie) return null;

    const supabase = await createClient();
    const { data, error } = await supabase.auth.getUser();
    if (error || !data?.user) return null;
    return data.user;
  } catch {
    return null;
  }
});

