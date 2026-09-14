'use server';

import { createClient } from '@/utils/supabase/server';
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

export async function setUsername(rawUsername: string) {
  const username = rawUsername.trim();
  const lower = username.toLowerCase();

  if (username.length < 3 || username.length > 20) {
    return { error: 'Username must be between 3 and 20 characters.' };
  }

  if (!/^[a-zA-Z0-9_]+$/.test(username)) {
    return { error: 'Only letters, numbers, and underscores are allowed.' };
  }

  if (RESERVED_USERNAMES.has(lower)) {
    return { error: 'This username is reserved. Please choose another.' };
  }

  const supabase = await createClient();
  const { data: { user }, error: userError } = await supabase.auth.getUser();

  if (userError || !user) {
    return { error: 'You must be signed in to choose a username.' };
  }

  // 1. Double check uniqueness
  const { data: existing } = await supabase
    .from('profiles')
    .select('id')
    .ilike('username', username)
    .neq('id', user.id)
    .maybeSingle();

  if (existing) {
    return { error: 'This username is already taken. Please pick a different one.' };
  }

  // 2. Update Supabase Auth metadata
  const { error: authError } = await supabase.auth.updateUser({
    data: {
      username: username,
    },
  });

  if (authError) {
    console.error('Error updating auth metadata:', authError);
    return { error: authError.message };
  }

  // 3. Upsert into public.profiles
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

  // Clear in-memory caches
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
