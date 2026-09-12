/**
 * ListMe Admin Utilities & Permission Checking
 * Controls platform-wide administration, support text channels, verified grants, and account suspensions.
 */

export const ADMIN_EMAILS = [
  'qrmooney@outlook.com',
  'admin@listme.ie',
  'support@listme.ie'
];

export interface AdminCheckableUser {
  id?: string;
  email?: string;
  user_metadata?: {
    role?: string;
    is_admin?: boolean;
    account_type?: string;
    banned_until?: string;
    is_banned?: boolean;
    ban_reason?: string;
    is_verified?: boolean;
    [key: string]: any;
  };
  app_metadata?: {
    role?: string;
    [key: string]: any;
  };
}

/**
 * Checks whether a given user object has platform administrator privileges.
 */
export function isAdmin(user: AdminCheckableUser | null | undefined): boolean {
  if (!user) return false;

  const email = user.email?.toLowerCase().trim();
  if (email && ADMIN_EMAILS.includes(email)) {
    return true;
  }

  if (user.user_metadata?.role === 'admin' || user.user_metadata?.is_admin === true) {
    return true;
  }

  if (user.app_metadata?.role === 'admin') {
    return true;
  }

  return false;
}

/**
 * Checks whether an account is currently suspended / banned.
 */
export function isAccountBanned(userOrProfile: any): { isBanned: boolean; bannedUntil?: string; reason?: string } {
  if (!userOrProfile) return { isBanned: false };

  const bannedUntil = userOrProfile.banned_until || userOrProfile.user_metadata?.banned_until;
  const isBannedFlag = userOrProfile.is_banned || userOrProfile.user_metadata?.is_banned;
  const reason = userOrProfile.ban_reason || userOrProfile.user_metadata?.ban_reason || 'Account suspended by administrator';

  if (bannedUntil) {
    const banDate = new Date(bannedUntil);
    if (!isNaN(banDate.getTime()) && banDate.getTime() > Date.now()) {
      return { isBanned: true, bannedUntil, reason };
    }
  }

  if (isBannedFlag) {
    return { isBanned: true, reason };
  }

  return { isBanned: false };
}
