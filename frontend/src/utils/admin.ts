
export const ADMIN_EMAILS = [
  'dahiruhammajam@gmail.com',
  'qrmooney@outlook.com',
  'admin@listme.ie',
  'support@listme.ie'
];

export const SUPPORT_OFFICER_USERNAMES = ['sahleyis', 'quinn'];
export const SUPPORT_OFFICER_EMAILS = [
  'dahiruhammajam@gmail.com',
  'qrmooney@outlook.com',
];
export const SUPPORT_OFFICER_UIDS = [
  '88beddab-0640-4f99-a04a-ff58c03704e4',
  '387eb6d6-e83c-4414-b0e3-831d60cd1c16',
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
    username?: string;
    preferred_username?: string;
    [key: string]: any;
  };
  app_metadata?: {
    role?: string;
    [key: string]: any;
  };
}

export function isSupportOfficer(user: AdminCheckableUser | null | undefined): boolean {
  if (!user) return false;
  if (user.id && SUPPORT_OFFICER_UIDS.includes(user.id)) return true;
  const email = user.email?.toLowerCase().trim();
  if (email && SUPPORT_OFFICER_EMAILS.includes(email)) return true;
  const username = (user.user_metadata?.username || user.user_metadata?.preferred_username || '')?.toLowerCase().trim();
  if (username && SUPPORT_OFFICER_USERNAMES.includes(username)) return true;
  return false;
}

export function isAdmin(user: AdminCheckableUser | null | undefined): boolean {
  if (!user) return false;

  if (isSupportOfficer(user)) {
    return true;
  }

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

export function isUserQuinn(user: AdminCheckableUser | null | undefined, extraUsername?: string): boolean {
  if (!user && !extraUsername) return false;
  if (user?.id === '387eb6d6-e83c-4414-b0e3-831d60cd1c16') return true;
  const email = user?.email?.toLowerCase().trim();
  if (email === 'qrmooney@outlook.com') return true;
  const username = (extraUsername || user?.user_metadata?.username || user?.user_metadata?.preferred_username || '')?.toLowerCase().trim();
  if (username === 'quinn') return true;
  return false;
}
