'use server'

import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'

export async function loginWithUsernameOrEmail(identifier: string, password: string) {
  let email = identifier;

  // If identifier does not look like an email, assume it's a username
  if (!identifier.includes('@')) {
    // We need the service role key to bypass RLS and look up the email
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    if (!serviceRoleKey) {
      return { error: 'Username login is not configured on the server (Missing SERVICE_ROLE_KEY)' };
    }

    const adminSupabase = createSupabaseClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      serviceRoleKey
    );

    const { data, error } = await adminSupabase
      .from('profiles')
      .select('email')
      .eq('username', identifier)
      .single();

    if (error || !data?.email) {
      return { error: 'Invalid login credentials' };
    }

    email = data.email;
  }

  // Now perform the standard login with the resolved email
  const cookieStore = await cookies();
  const supabase = createServerClient(
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
          } catch (error) {}
        },
      },
    }
  );

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return { error: error.message };
  }

  return { success: true };
}
