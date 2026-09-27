'use server';

import { createAdminClient, createPublicClient } from '@/utils/supabase/server';

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

export interface RegistrationCheckResult {
  available: boolean;
  error?: string;
  field?: 'email' | 'username';
}

function getSafeClient(): { client: any; isAdmin: boolean } {
  try {
    const admin = createAdminClient();
    if (admin) return { client: admin, isAdmin: true };
  } catch {
    // Fall back to public client if admin credentials unavailable
  }
  return { client: createPublicClient(), isAdmin: false };
}

/**
 * Checks if a username is valid, unreserved, and completely unique across ListMe.
 */
export async function checkUsernameAvailability(username: string): Promise<{ available: boolean; error?: string }> {
  const cleanUsername = username.trim().toLowerCase();

  if (cleanUsername.length < 3 || cleanUsername.length > 20) {
    return {
      available: false,
      error: 'Username must be between 3 and 20 characters.',
    };
  }

  if (!/^[a-zA-Z0-9_]+$/.test(cleanUsername)) {
    return {
      available: false,
      error: 'Username can only contain letters, numbers, and underscores.',
    };
  }

  if (RESERVED_USERNAMES.has(cleanUsername)) {
    return {
      available: false,
      error: 'That username is reserved by the platform. Please choose another.',
    };
  }

  const { client, isAdmin } = getSafeClient();

  // 1. Check public.profiles table for matching username (case-insensitive)
  try {
    const { data: existingProfile, error: profileErr } = await client
      .from('profiles')
      .select('id, username')
      .ilike('username', cleanUsername)
      .maybeSingle();

    if (!profileErr && existingProfile) {
      return {
        available: false,
        error: 'That username is already taken. Please choose another.',
      };
    }
  } catch (err) {
    console.error('Error checking profile username availability:', err);
  }

  // 2. Check auth.users table metadata for registered users
  if (isAdmin) {
    try {
      const { data: usersData, error: usersErr } = await client.auth.admin.listUsers({ perPage: 1000 });
      if (!usersErr && usersData?.users) {
        for (const u of usersData.users) {
          const userMetaName = (u.user_metadata?.username || '').toLowerCase();
          if (userMetaName && userMetaName === cleanUsername) {
            return {
              available: false,
              error: 'That username is already taken. Please choose another.',
            };
          }
        }
      }
    } catch (err) {
      console.error('Error checking auth.users for username availability:', err);
    }
  }

  return { available: true };
}

/**
 * Validates that the provided email and username are available before registration.
 * Enforces that each email is strictly tied to a single account and each username is unique.
 */
export async function checkRegistrationAvailability({
  email,
  username,
}: {
  email: string;
  username: string;
}): Promise<RegistrationCheckResult> {
  const cleanEmail = email.trim().toLowerCase();

  // 1. Email format validation
  if (!cleanEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
    return {
      available: false,
      error: 'Please enter a valid email address.',
      field: 'email',
    };
  }

  // 2. Username format and uniqueness validation
  const usernameCheck = await checkUsernameAvailability(username);
  if (!usernameCheck.available) {
    return {
      available: false,
      error: usernameCheck.error || 'That username is already taken. Please choose another.',
      field: 'username',
    };
  }

  const { client, isAdmin } = getSafeClient();

  // 3. Check public.profiles table for matching email
  try {
    const { data: existingEmail, error: emailErr } = await client
      .from('profiles')
      .select('id, email')
      .ilike('email', cleanEmail)
      .maybeSingle();

    if (!emailErr && existingEmail) {
      return {
        available: false,
        error: 'An account with this email address already exists. Please log in instead.',
        field: 'email',
      };
    }
  } catch (err) {
    console.error('Error checking profile email availability:', err);
  }

  // 4. Check auth.users table for matching email
  if (isAdmin) {
    try {
      const { data: usersData, error: usersErr } = await client.auth.admin.listUsers({ perPage: 1000 });
      if (!usersErr && usersData?.users) {
        for (const u of usersData.users) {
          if (u.email && u.email.toLowerCase() === cleanEmail) {
            return {
              available: false,
              error: 'An account with this email address already exists. Please log in instead.',
              field: 'email',
            };
          }
        }
      }
    } catch (err) {
      console.error('Error checking auth.users for registration email availability:', err);
    }
  }

  return { available: true };
}

/**
 * Synchronizes newly registered user's unique username and profile details directly to public.profiles.
 */
export async function syncRegisteredUserProfile({
  userId,
  email,
  username,
  accountType = 'personal',
}: {
  userId: string;
  email: string;
  username: string;
  accountType?: 'personal' | 'business';
}) {
  const cleanEmail = email.trim().toLowerCase();
  const cleanUsername = username.trim();

  const { client } = getSafeClient();

  try {
    await client.from('profiles').upsert(
      {
        id: userId,
        email: cleanEmail,
        username: cleanUsername,
        account_type: accountType,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'id' }
    );
  } catch (err) {
    console.error('Error synchronizing registered user profile:', err);
  }
}
