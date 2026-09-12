'use server';

import { createClient as createServerClient } from '@/utils/supabase/server';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { revalidatePath } from 'next/cache';
import { isAdmin, ADMIN_EMAILS } from '@/utils/admin';

function getAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) {
    throw new Error('Supabase service role credentials not configured.');
  }
  return createSupabaseClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

/**
 * Ensures the currently authenticated caller is an authorized Admin.
 */
async function requireAdminCaller() {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user || !isAdmin(user)) {
    throw new Error('Unauthorized: Admin privileges required.');
  }

  return user;
}

/**
 * Assigns Admin role to a user account.
 */
export async function assignAdminRoleAction(targetUserId: string) {
  try {
    await requireAdminCaller();
    const adminClient = getAdminClient();

    const { data: targetUser, error: fetchErr } = await adminClient.auth.admin.getUserById(targetUserId);
    if (fetchErr || !targetUser?.user) {
      return { error: 'Target user not found.' };
    }

    const currentMeta = targetUser.user.user_metadata || {};
    const { error: updateErr } = await adminClient.auth.admin.updateUserById(targetUserId, {
      user_metadata: {
        ...currentMeta,
        role: 'admin',
        is_admin: true,
      }
    });

    if (updateErr) {
      return { error: updateErr.message };
    }

    revalidatePath(`/member/${targetUserId}`);
    return { success: true, message: 'Admin role granted successfully.' };
  } catch (err: any) {
    return { error: err.message || 'Failed to assign admin role.' };
  }
}

/**
 * Revokes Admin role from a user account.
 */
export async function revokeAdminRoleAction(targetUserId: string) {
  try {
    const caller = await requireAdminCaller();
    if (caller.id === targetUserId) {
      return { error: 'You cannot revoke your own administrator access.' };
    }

    const adminClient = getAdminClient();
    const { data: targetUser } = await adminClient.auth.admin.getUserById(targetUserId);
    if (!targetUser?.user) {
      return { error: 'Target user not found.' };
    }

    const currentMeta = targetUser.user.user_metadata || {};
    const { error: updateErr } = await adminClient.auth.admin.updateUserById(targetUserId, {
      user_metadata: {
        ...currentMeta,
        role: 'user',
        is_admin: false,
      }
    });

    if (updateErr) {
      return { error: updateErr.message };
    }

    revalidatePath(`/member/${targetUserId}`);
    return { success: true, message: 'Admin role revoked.' };
  } catch (err: any) {
    return { error: err.message || 'Failed to revoke admin role.' };
  }
}

/**
 * Grants a free Verified Badge to an account.
 */
export async function grantFreeVerifiedAction(targetUserId: string, reason: string = 'Personal Admin Verification') {
  try {
    await requireAdminCaller();
    const adminClient = getAdminClient();

    const { data: targetUser, error: fetchErr } = await adminClient.auth.admin.getUserById(targetUserId);
    if (fetchErr || !targetUser?.user) {
      return { error: 'Target user not found.' };
    }

    const currentMeta = targetUser.user.user_metadata || {};
    const nowIso = new Date().toISOString();

    // 1. Update user auth metadata
    const { error: authErr } = await adminClient.auth.admin.updateUserById(targetUserId, {
      user_metadata: {
        ...currentMeta,
        is_verified: true,
        verified_account: true,
        verified_at: nowIso,
        verified_reason: reason,
      }
    });

    if (authErr) {
      return { error: authErr.message };
    }

    // 2. Update profiles table if possible
    try {
      await adminClient
        .from('profiles')
        .update({
          is_verified: true,
          updated_at: nowIso,
        })
        .eq('id', targetUserId);
    } catch (e) {
      console.warn('Profiles update notice (non-fatal):', e);
    }

    revalidatePath(`/member/${targetUserId}`);
    revalidatePath('/');
    return { success: true, message: 'Free Verified Badge granted to user!' };
  } catch (err: any) {
    return { error: err.message || 'Failed to grant verification.' };
  }
}

/**
 * Revokes Verified status from an account.
 */
export async function revokeVerifiedAction(targetUserId: string) {
  try {
    await requireAdminCaller();
    const adminClient = getAdminClient();

    const { data: targetUser } = await adminClient.auth.admin.getUserById(targetUserId);
    if (!targetUser?.user) {
      return { error: 'Target user not found.' };
    }

    const currentMeta = targetUser.user.user_metadata || {};
    await adminClient.auth.admin.updateUserById(targetUserId, {
      user_metadata: {
        ...currentMeta,
        is_verified: false,
        verified_account: false,
      }
    });

    try {
      await adminClient.from('profiles').update({ is_verified: false }).eq('id', targetUserId);
    } catch {}

    revalidatePath(`/member/${targetUserId}`);
    return { success: true, message: 'Verified badge revoked.' };
  } catch (err: any) {
    return { error: err.message || 'Failed to revoke verification.' };
  }
}

/**
 * Bans / shuts down an account for a set period or permanently.
 * durationHours: 24 (1 day), 168 (7 days), 720 (30 days), or -1 / 0 for permanent shut down.
 */
export async function banUserAccountAction(targetUserId: string, durationHours: number, reason: string) {
  try {
    const caller = await requireAdminCaller();
    if (caller.id === targetUserId) {
      return { error: 'You cannot ban your own administrator account.' };
    }

    const adminClient = getAdminClient();
    const { data: targetUser, error: fetchErr } = await adminClient.auth.admin.getUserById(targetUserId);
    if (fetchErr || !targetUser?.user) {
      return { error: 'Target user not found.' };
    }

    const isPermanent = durationHours <= 0;
    const bannedUntilDate = isPermanent 
      ? new Date(Date.now() + 100 * 365 * 24 * 60 * 60 * 1000).toISOString() // 100 years
      : new Date(Date.now() + durationHours * 60 * 60 * 1000).toISOString();

    const currentMeta = targetUser.user.user_metadata || {};
    const { error: updateErr } = await adminClient.auth.admin.updateUserById(targetUserId, {
      user_metadata: {
        ...currentMeta,
        is_banned: true,
        banned_until: bannedUntilDate,
        ban_reason: reason.trim() || 'Suspended by platform administrator',
        banned_at: new Date().toISOString(),
      }
    });

    if (updateErr) {
      return { error: updateErr.message };
    }

    // Also close and hide any active listings by this user for safety
    try {
      await adminClient
        .from('listings')
        .update({ status: 'closed' })
        .eq('seller_id', targetUserId)
        .eq('status', 'active');
    } catch {}

    revalidatePath(`/member/${targetUserId}`);
    revalidatePath('/');
    return { 
      success: true, 
      message: isPermanent 
        ? 'Account has been permanently shut down and banned.' 
        : `Account suspended for ${durationHours} hours.` 
    };
  } catch (err: any) {
    return { error: err.message || 'Failed to ban user account.' };
  }
}

/**
 * Unbans a previously suspended account.
 */
export async function unbanUserAccountAction(targetUserId: string) {
  try {
    await requireAdminCaller();
    const adminClient = getAdminClient();

    const { data: targetUser } = await adminClient.auth.admin.getUserById(targetUserId);
    if (!targetUser?.user) {
      return { error: 'Target user not found.' };
    }

    const currentMeta = targetUser.user.user_metadata || {};
    const { error: updateErr } = await adminClient.auth.admin.updateUserById(targetUserId, {
      user_metadata: {
        ...currentMeta,
        is_banned: false,
        banned_until: null,
        ban_reason: null,
      }
    });

    if (updateErr) {
      return { error: updateErr.message };
    }

    revalidatePath(`/member/${targetUserId}`);
    return { success: true, message: 'Account unbanned. Access restored.' };
  } catch (err: any) {
    return { error: err.message || 'Failed to unban user account.' };
  }
}

/**
 * Fetches all support tickets across all users for Admin review.
 */
export async function getAllSupportTicketsAdminAction() {
  try {
    await requireAdminCaller();
    const adminClient = getAdminClient();

    // List recent users to collect support tickets from metadata
    const { data: usersData, error } = await adminClient.auth.admin.listUsers({ perPage: 100 });
    if (error) {
      return { error: error.message, tickets: [] };
    }

    const allTickets: any[] = [];
    for (const u of usersData.users || []) {
      const tickets = u.user_metadata?.support_tickets;
      if (Array.isArray(tickets) && tickets.length > 0) {
        for (const t of tickets) {
          allTickets.push({
            ...t,
            userId: u.id,
            userEmail: u.email,
            userDisplayName: u.user_metadata?.full_name || u.user_metadata?.username || u.email?.split('@')[0],
          });
        }
      }
    }

    // Sort tickets by created timestamp descending
    allTickets.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());

    return { success: true, tickets: allTickets };
  } catch (err: any) {
    return { error: err.message || 'Failed to load tickets.', tickets: [] };
  }
}

/**
 * Admin responds to a user's support ticket across channels.
 */
export async function adminReplySupportTicketAction(
  targetUserId: string,
  ticketId: string,
  replyContent: string,
  newStatus?: string
) {
  try {
    const adminCaller = await requireAdminCaller();
    const adminClient = getAdminClient();

    const { data: targetUser, error: fetchErr } = await adminClient.auth.admin.getUserById(targetUserId);
    if (fetchErr || !targetUser?.user) {
      return { error: 'Target user not found.' };
    }

    const currentMeta = targetUser.user.user_metadata || {};
    const tickets = (currentMeta.support_tickets || []) as any[];
    const ticketIdx = tickets.findIndex(t => t.id === ticketId);

    if (ticketIdx === -1) {
      return { error: 'Ticket not found on user account.' };
    }

    const adminName = adminCaller.user_metadata?.full_name || 'ListMe Official Support';
    const nowIso = new Date().toISOString();

    const newMsg = {
      id: `msg-${Date.now()}`,
      sender: 'support',
      senderName: `${adminName} (Admin)`,
      content: replyContent.trim(),
      timestamp: new Date().toLocaleTimeString('en-IE', { hour: '2-digit', minute: '2-digit' }),
    };

    tickets[ticketIdx].messages = [...(tickets[ticketIdx].messages || []), newMsg];
    if (newStatus) {
      tickets[ticketIdx].status = newStatus;
    }

    const { error: updateErr } = await adminClient.auth.admin.updateUserById(targetUserId, {
      user_metadata: {
        ...currentMeta,
        support_tickets: tickets,
      }
    });

    if (updateErr) {
      return { error: updateErr.message };
    }

    return { success: true, updatedTicket: tickets[ticketIdx] };
  } catch (err: any) {
    return { error: err.message || 'Failed to send admin reply.' };
  }
}
