'use server';

import { createClient } from '@/utils/supabase/server';
import { createClient as createAdminClient } from '@supabase/supabase-js';
import { revalidatePath } from 'next/cache';

const RESERVED_USERNAMES = new Set([
  'admin',
  'administrator',
  'root',
  'support',
  'help',
  'listme',
  'team',
  'mod',
  'moderator',
  'official',
  'api',
  'auth',
  'login',
  'register',
  'search',
  'browse',
  'marketplace',
  'jobs',
  'services',
  'community',
  'terms',
  'privacy',
  'safety',
  'buyer-protection',
  'fees',
  'motors',
  'property',
]);

export async function checkUsernameAvailability(username: string) {
  const trimmed = username.trim().toLowerCase();
  
  if (trimmed.length < 3 || trimmed.length > 20) {
    return { available: false, error: 'Username must be between 3 and 20 characters.' };
  }

  if (!/^[a-zA-Z0-9_]+$/.test(trimmed)) {
    return { available: false, error: 'Only letters, numbers, and underscores are allowed.' };
  }

  if (RESERVED_USERNAMES.has(trimmed)) {
    return { available: false, error: 'This username is reserved.' };
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const query = supabase
    .from('profiles')
    .select('id')
    .ilike('username', trimmed);

  if (user) {
    query.neq('id', user.id);
  }

  const { data: existing } = await query.maybeSingle();

  if (existing) {
    return { available: false, error: 'This username is already taken.' };
  }

  return { available: true };
}

export async function setupAccountAction({
  rawUsername,
  password,
  confirmPassword,
}: {
  rawUsername: string;
  password?: string;
  confirmPassword?: string;
}) {
  const username = rawUsername.trim();
  const lower = username.toLowerCase();

  if (username.length < 3 || username.length > 20) {
    return { error: 'Username must be between 3 and 20 characters.' };
  }

  if (!/^[a-zA-Z0-9_]+$/.test(username)) {
    return { error: 'Only letters, numbers, and underscores are allowed in usernames.' };
  }

  if (RESERVED_USERNAMES.has(lower)) {
    return { error: 'This username is reserved. Please choose another.' };
  }

  if (!password || password.length < 6) {
    return { error: 'Password must be at least 6 characters long.' };
  }

  if (password !== confirmPassword) {
    return { error: 'Passwords do not match.' };
  }

  const supabase = await createClient();
  const { data: { user }, error: userError } = await supabase.auth.getUser();

  if (userError || !user) {
    return { error: 'You must be signed in to complete account setup.' };
  }

  const { data: existing } = await supabase
    .from('profiles')
    .select('id')
    .ilike('username', username)
    .neq('id', user.id)
    .maybeSingle();

  if (existing) {
    return { error: 'This username is already taken. Please pick a different one.' };
  }

  const { error: authError } = await supabase.auth.updateUser({
    password: password,
    data: {
      username: username,
      has_password: true,
    },
  });

  if (authError) {
    console.warn('supabase.auth.updateUser warning:', authError.message);
  }

  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

  if (serviceRoleKey && supabaseUrl) {
    try {
      const admin = createAdminClient(supabaseUrl, serviceRoleKey, {
        auth: { persistSession: false },
      });
      const { error: adminErr } = await admin.auth.admin.updateUserById(user.id, {
        password: password,
        user_metadata: {
          ...(user.user_metadata || {}),
          username: username,
          has_password: true,
        },
      });
      if (adminErr) {
        console.error('Admin updateUserById error:', adminErr);
      }
    } catch (err) {
      console.error('Admin updateUserById exception:', err);
    }
  }

  const { error: profileError } = await supabase
    .from('profiles')
    .upsert({
      id: user.id,
      username: username,
      email: user.email,
      updated_at: new Date().toISOString(),
    }, {
      onConflict: 'id',
    });

  if (profileError) {
    console.error('Error updating public.profiles:', profileError);
    return { error: 'Failed to save username. Please try again.' };
  }

  if (globalThis.__allProfilesCache) {
    globalThis.__allProfilesCache = undefined;
  }
  if (globalThis.__userMetaCache) {
    globalThis.__userMetaCache.delete(user.id);
  }

  revalidatePath('/', 'layout');
  revalidatePath('/my-listme');
  revalidatePath('/member/[id]', 'page');

  return { success: true };
}

export async function setUsername(rawUsername: string) {
  return setupAccountAction({ rawUsername });
}
