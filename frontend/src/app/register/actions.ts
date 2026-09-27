'use server';

import { createAdminClient } from '@/utils/supabase/server';

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

/**
 * Validates that the provided email and username are available before registration.
 * Enforces that each email is strictly tied to a single account only.
 */
export async function checkRegistrationAvailability({
  email,
  username,
}: {
  email: string;
  username: string;
}): Promise<RegistrationCheckResult> {
  const cleanEmail = email.trim().toLowerCase();
  const cleanUsername = username.trim().toLowerCase();

  // 1. Email format validation
  if (!cleanEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
    return {
      available: false,
      error: 'Please enter a valid email address.',
      field: 'email',
    };
  }

  // 2. Username format and length validation
  if (cleanUsername.length < 3 || cleanUsername.length > 20) {
    return {
      available: false,
      error: 'Username must be between 3 and 20 characters.',
      field: 'username',
    };
  }

  if (!/^[a-zA-Z0-9_]+$/.test(cleanUsername)) {
    return {
      available: false,
      error: 'Username can only contain letters, numbers, and underscores.',
      field: 'username',
    };
  }

  if (RESERVED_USERNAMES.has(cleanUsername)) {
    return {
      available: false,
      error: 'That username is reserved by the platform. Please choose another.',
      field: 'username',
    };
  }

  const adminClient = createAdminClient();
  if (!adminClient) {
    return { available: true };
  }

  // 3. Check public.profiles table for matching email or username
  try {
    const { data: existingProfiles, error: profileErr } = await adminClient
      .from('profiles')
      .select('id, email, username')
      .or(`email.ilike.${cleanEmail},username.ilike.${cleanUsername}`);

    if (!profileErr && existingProfiles && existingProfiles.length > 0) {
      for (const p of existingProfiles) {
        if (p.email && p.email.toLowerCase() === cleanEmail) {
          return {
            available: false,
            error: 'An account with this email address already exists. Please log in instead.',
            field: 'email',
          };
        }
        if (p.username && p.username.toLowerCase() === cleanUsername) {
          return {
            available: false,
            error: 'That username is already taken. Please choose another.',
            field: 'username',
          };
        }
      }
    }
  } catch (err) {
    console.error('Error checking profiles for registration availability:', err);
  }

  // 4. Check auth.users table for matching email or metadata username
  try {
    const { data: usersData, error: usersErr } = await adminClient.auth.admin.listUsers({ perPage: 1000 });
    if (!usersErr && usersData?.users) {
      for (const u of usersData.users) {
        if (u.email && u.email.toLowerCase() === cleanEmail) {
          return {
            available: false,
            error: 'An account with this email address already exists. Please log in instead.',
            field: 'email',
          };
        }
        const userMetaName = (u.user_metadata?.username || '').toLowerCase();
        if (userMetaName && userMetaName === cleanUsername) {
          return {
            available: false,
            error: 'That username is already taken. Please choose another.',
            field: 'username',
          };
        }
      }
    }
  } catch (err) {
    console.error('Error checking auth.users for registration availability:', err);
  }

  return { available: true };
}
