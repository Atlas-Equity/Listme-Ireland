'use server';

import { createClient } from '@/utils/supabase/server';
import { createClient as createAdminClient } from '@supabase/supabase-js';
import { revalidatePath } from 'next/cache';
import { isAdmin } from '@/utils/admin';

export interface TeamMemberData {
  user_id: string;
  username: string;
  role?: string;
  joined_at?: string;
}

export interface BusinessPageData {
  id?: string;
  name: string;
  slug: string;
  tagline: string;
  business_type?: 'service' | 'marketplace';
  opening_hours?: string;
  announcement?: string;
  category: string;
  county: string;
  phone: string;
  email: string;
  website?: string;
  facebook?: string;
  linkedin?: string;
  avatarUrl?: string;
  coverUrl?: string;
  plan?: string;
  created_at?: string;
  owner_id?: string;
  is_hiring?: boolean;
  allow_direct_messaging?: boolean;
  is_verified?: boolean;
  team_members?: (string | TeamMemberData)[];
  pending_invites?: { username: string; user_id?: string; invited_at: string }[];
}

const OFFICIAL_FACEBOOK_URL = 'https://www.facebook.com/profile.php?id=61594336620072';

/**
 * Creates or updates a subsidiary business page under the user's account.
 */
export async function createOrUpdateBusinessPage(data: BusinessPageData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { error: 'You must be logged in to create or update a Business Page.' };
  }

  const cleanSlug = (data.slug || data.name)
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9-]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');

  if (!cleanSlug) {
    return { error: 'Please enter a valid page name or handle slug.' };
  }

  // 1. Reserved platform slugs check
  const RESERVED_SLUGS = new Set([
    'listme', 'official', 'admin', 'administrator', 'support', 'help',
    'api', 'auth', 'login', 'signup', 'register', 'settings', 'account',
    'marketplace', 'services', 'jobs', 'community', 'messages', 'terms', 'privacy', 'about'
  ]);

  const userIsAdmin = isAdmin(user);
  if (RESERVED_SLUGS.has(cleanSlug) && !userIsAdmin) {
    return { error: `The handle "${cleanSlug}" is reserved by the ListMe platform. Please choose a different handle.` };
  }

  // 2. Global uniqueness check across all registered business pages
  const allRegistered = await getAllRegisteredBusinessPages();
  const existingGlobalPage = allRegistered.find(p => p.slug === cleanSlug);
  if (existingGlobalPage && existingGlobalPage.owner_id && existingGlobalPage.owner_id !== user.id) {
    return { error: `The handle "${cleanSlug}" is already taken by another registered business. Please choose a different name or handle.` };
  }

  // Format phone to Irish standard (optional for official ListMe page)
  let formattedPhone = (data.phone || '').trim();
  const isOfficial = cleanSlug === 'listme';
  if (isOfficial && (!formattedPhone || formattedPhone === '+353' || formattedPhone === '+353 ')) {
    formattedPhone = '';
  } else if (formattedPhone && !formattedPhone.startsWith('+353')) {
    formattedPhone = `+353 ${formattedPhone.replace(/^\+?353\s?|^0/, '')}`.trim();
  }

  // Truncate announcement to 250 characters max
  const cleanAnnouncement = (data.announcement || '').trim().slice(0, 250);

  // Fetch freshest user metadata via admin client if available
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  let currentUserMeta = user.user_metadata || {};
  let adminClient: any = null;

  if (serviceKey && supabaseUrl) {
    adminClient = createAdminClient(supabaseUrl, serviceKey, { auth: { persistSession: false } });
    try {
      const { data: adminUser } = await adminClient.auth.admin.getUserById(user.id);
      if (adminUser?.user?.user_metadata) {
        currentUserMeta = adminUser.user.user_metadata;
      }
    } catch (err) {
      console.warn('Could not fetch freshest user metadata from adminClient:', err);
    }
  }

  const existingPages: BusinessPageData[] = currentUserMeta?.business_pages || [];

  const newPage: BusinessPageData = {
    id: data.id || `biz_${Date.now()}`,
    name: data.name.trim(),
    slug: cleanSlug,
    tagline: data.tagline.trim(),
    business_type: data.business_type || 'service',
    opening_hours: data.opening_hours?.trim() || 'Open 24 Hours / 7 Days',
    announcement: cleanAnnouncement,
    category: data.category || (data.business_type === 'marketplace' ? 'Retail & Local Storefront' : 'Services & Trades'),
    county: data.county || 'Dublin',
    phone: formattedPhone,
    email: data.email.trim(),
    website: data.website?.trim() || '',
    facebook: data.facebook?.trim() || OFFICIAL_FACEBOOK_URL,
    linkedin: data.linkedin?.trim() || '',
    avatarUrl: data.avatarUrl?.trim() || currentUserMeta?.avatar_url || '',
    coverUrl: data.coverUrl || '',
    plan: isOfficial ? 'Official Platform Storefront' : (data.is_verified ? 'Verified Pro Page' : 'Commercial Storefront'),
    is_verified: isOfficial ? true : Boolean(data.is_verified),
    allow_direct_messaging: Boolean(data.allow_direct_messaging),
    created_at: data.created_at || new Date().toISOString(),
    owner_id: user.id,
    is_hiring: Boolean(data.is_hiring),
    team_members: Array.isArray(data.team_members) ? data.team_members : [],
    pending_invites: Array.isArray(data.pending_invites) ? data.pending_invites : [],
  };

  // Match by id OR slug
  const pageIndex = existingPages.findIndex(
    p => (data.id && p.id === data.id) || (data.slug && p.slug === data.slug) || p.slug === cleanSlug
  );

  let updatedPages: BusinessPageData[];
  if (pageIndex >= 0) {
    updatedPages = [...existingPages];
    updatedPages[pageIndex] = { ...existingPages[pageIndex], ...newPage };
  } else {
    updatedPages = [...existingPages, newPage];
  }

  // Update user metadata via Admin API for 100% reliable persistence
  if (adminClient) {
    try {
      await adminClient.auth.admin.updateUserById(user.id, {
        user_metadata: {
          ...currentUserMeta,
          business_pages: updatedPages,
        },
      });
    } catch (adminErr) {
      console.error('Error updating business page via adminClient:', adminErr);
    }
  }

  // Also update session cookie client
  const { error: updateErr } = await supabase.auth.updateUser({
    data: {
      business_pages: updatedPages,
    }
  });

  if (updateErr && !adminClient) {
    return { error: updateErr.message };
  }

  invalidateBusinessPagesCache();
  revalidatePath('/my-listme');
  revalidatePath(`/page/${cleanSlug}`);
  revalidatePath('/services');
  revalidatePath('/marketplace');
  revalidatePath('/jobs');
  return { success: true, slug: cleanSlug, page: newPage };
}

/**
 * Deletes a business page owned by the current user.
 */
export async function deleteBusinessPage(slugOrId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { error: 'You must be logged in to delete a Business Page.' };
  }

  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  let currentUserMeta = user.user_metadata || {};
  let adminClient: any = null;

  if (serviceKey && supabaseUrl) {
    adminClient = createAdminClient(supabaseUrl, serviceKey, { auth: { persistSession: false } });
    try {
      const { data: adminUser } = await adminClient.auth.admin.getUserById(user.id);
      if (adminUser?.user?.user_metadata) {
        currentUserMeta = adminUser.user.user_metadata;
      }
    } catch (err) {}
  }

  const existingPages: BusinessPageData[] = currentUserMeta?.business_pages || [];
  const targetPage = existingPages.find(p => p.id === slugOrId || p.slug === slugOrId);

  if (!targetPage) {
    return { error: 'Business Page not found.' };
  }

  const updatedPages = existingPages.filter(p => p.id !== slugOrId && p.slug !== slugOrId);

  if (adminClient) {
    try {
      await adminClient.auth.admin.updateUserById(user.id, {
        user_metadata: {
          ...currentUserMeta,
          business_pages: updatedPages,
        },
      });
    } catch (err) {}
  }

  await supabase.auth.updateUser({
    data: {
      business_pages: updatedPages,
    }
  });

  invalidateBusinessPagesCache();
  revalidatePath('/my-listme');
  revalidatePath(`/page/${targetPage.slug}`);
  revalidatePath('/services');
  revalidatePath('/marketplace');
  revalidatePath('/jobs');
  return { success: true };
}

// In-memory cache on globalThis with 60-second TTL
declare global {
  var __businessPagesCache: { pages: BusinessPageData[]; expiresAt: number } | undefined;
  var __jobCandidatesCache: { candidates: any[]; expiresAt: number } | undefined;
}

export function invalidateBusinessPagesCache(): void {
  globalThis.__businessPagesCache = undefined;
  globalThis.__jobCandidatesCache = undefined;
}

/**
 * Returns all real registered business pages across all users (cached for 60s).
 */
export async function getAllRegisteredBusinessPages(): Promise<BusinessPageData[]> {
  const cached = globalThis.__businessPagesCache;
  if (cached && Date.now() < cached.expiresAt) {
    return cached.pages;
  }

  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!serviceKey || !url) return [];

  try {
    const adminClient = createAdminClient(url, serviceKey, {
      auth: { persistSession: false },
    });
    const { data: usersData, error } = await adminClient.auth.admin.listUsers({ perPage: 100 });
    if (error || !usersData?.users) return cached?.pages || [];

    const rawPages: { page: BusinessPageData; owner_id: string; created_time: number }[] = [];

    for (const u of usersData.users) {
      const pages = u.user_metadata?.business_pages as BusinessPageData[];
      if (Array.isArray(pages)) {
        for (const p of pages) {
          if (p && p.slug) {
            rawPages.push({
              page: p,
              owner_id: u.id,
              created_time: p.created_at ? new Date(p.created_at).getTime() : 0,
            });
          }
        }
      }
    }

    // Sort chronologically ascending so the original creator is always canonical
    rawPages.sort((a, b) => a.created_time - b.created_time);

    const allPages: BusinessPageData[] = [];
    const seenSlugs = new Set<string>();

    for (const item of rawPages) {
      if (!seenSlugs.has(item.page.slug)) {
        seenSlugs.add(item.page.slug);
        allPages.push({
          ...item.page,
          owner_id: item.owner_id,
        });
      }
    }

    // Populate candidates cache from the same user list to save an extra roundtrip
    const candidates = usersData.users
      .filter((u) => u.user_metadata?.bio || u.user_metadata?.skills || u.user_metadata?.looking_for_work)
      .map((u) => {
        let hash = 0;
        const uid = u.id || '';
        for (let i = 0; i < uid.length; i++) {
          hash = (hash << 5) - hash + uid.charCodeAt(i);
          hash |= 0;
        }
        const memberNumber = 6000000 + Math.abs(hash % 3999999);
        return {
          id: u.id,
          name: u.user_metadata?.full_name || u.user_metadata?.username || u.email?.split('@')[0] || 'Member',
          memberNumber,
          bio: u.user_metadata?.bio || 'Verified member open to opportunities.',
          skills: u.user_metadata?.skills || '',
          location: u.user_metadata?.location || 'Ireland',
          avatarUrl: u.user_metadata?.avatar_url || '',
          contactEmail: u.email,
        };
      });

    // Ensure official ListMe storefront is always present
    if (!seenSlugs.has('listme')) {
      allPages.unshift({
        name: 'ListMe',
        slug: 'listme',
        tagline: 'Official platform storefront for ListMe Ireland — verified marketplace listings, announcements, safety guidelines, and direct community support.',
        category: 'Retail & Local Storefront',
        business_type: 'marketplace',
        county: 'Dublin',
        phone: '',
        email: 'support@listme.ie',
        website: 'https://listme.ie',
        facebook: 'https://www.facebook.com/profile.php?id=61594336620072',
        plan: 'Official Platform Storefront',
        announcement: 'Welcome to ListMe Ireland! Ireland’s next-generation platform for items, jobs, and services across all 32 counties.',
        opening_hours: 'Open 24 Hours / 7 Days',
        created_at: new Date(2023, 0, 1).toISOString(),
        avatarUrl: '/clover-logo.png',
        coverUrl: '/ListMeBanner.png',
        is_verified: true,
        allow_direct_messaging: false,
      });
      seenSlugs.add('listme');
    }

    // Always sort official ListMe storefront to index 0
    allPages.sort((a, b) => {
      const isA = a.slug?.toLowerCase() === 'listme' || a.name?.toLowerCase() === 'listme';
      const isB = b.slug?.toLowerCase() === 'listme' || b.name?.toLowerCase() === 'listme';
      if (isA && !isB) return -1;
      if (!isA && isB) return 1;
      return 0;
    });

    globalThis.__businessPagesCache = {
      pages: allPages,
      expiresAt: Date.now() + 60 * 1000,
    };

    globalThis.__jobCandidatesCache = {
      candidates,
      expiresAt: Date.now() + 60 * 1000,
    };

    return allPages;
  } catch (err) {
    console.error('Error fetching registered business pages:', err);
    return cached?.pages || [];
  }
}

/**
 * Returns cached job candidates (extracted during business pages fetch).
 */
export async function getCachedJobCandidates(): Promise<any[]> {
  if (globalThis.__jobCandidatesCache && Date.now() < globalThis.__jobCandidatesCache.expiresAt) {
    return globalThis.__jobCandidatesCache.candidates;
  }
  // Refresh by calling getAllRegisteredBusinessPages
  await getAllRegisteredBusinessPages();
  return globalThis.__jobCandidatesCache?.candidates || [];
}

/**
 * Invites a user to a business page team by their @username.
 */
export async function inviteBusinessTeamMemberAction(pageSlug: string, targetUsername: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { error: 'You must be signed in to invite team members.' };
  }

  const cleanUser = targetUsername.replace(/^@/, '').trim().toLowerCase();
  if (!cleanUser) {
    return { error: 'Please enter a valid @username.' };
  }

  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!serviceKey || !supabaseUrl) {
    return { error: 'Server configuration error.' };
  }

  const adminClient = createAdminClient(supabaseUrl, serviceKey, { auth: { persistSession: false } });

  // 1. Fetch freshest owner metadata to find the business page
  const { data: adminUser } = await adminClient.auth.admin.getUserById(user.id);
  const ownerMeta = adminUser?.user?.user_metadata || {};
  const businessPages: BusinessPageData[] = ownerMeta.business_pages || [];
  const pageIdx = businessPages.findIndex((p) => p.slug === pageSlug);

  if (pageIdx < 0) {
    return { error: 'Business page not found under your account.' };
  }

  const page = businessPages[pageIdx];

  // 2. Lookup target user by username in profiles table first
  const { data: profile } = await adminClient
    .from('profiles')
    .select('id, username')
    .ilike('username', cleanUser)
    .maybeSingle();

  let targetUserId = profile?.id;
  let resolvedUsername = profile?.username || cleanUser;

  if (!targetUserId) {
    // Check auth users list
    const { data: usersData } = await adminClient.auth.admin.listUsers({ perPage: 100 });
    const matchedUser = usersData?.users.find(
      (u) =>
        u.user_metadata?.username?.toLowerCase() === cleanUser ||
        u.email?.split('@')[0]?.toLowerCase() === cleanUser
    );
    if (matchedUser) {
      targetUserId = matchedUser.id;
      resolvedUsername = matchedUser.user_metadata?.username || cleanUser;
    }
  }

  if (!targetUserId) {
    return { error: `User @${cleanUser} was not found on ListMe.` };
  }

  if (targetUserId === user.id) {
    return { error: 'You cannot invite yourself as you already own this page.' };
  }

  // Check if user is already a team member
  const currentMembers = Array.isArray(page.team_members) ? page.team_members : [];
  if (currentMembers.includes(targetUserId)) {
    return { error: `@${resolvedUsername} is already a member of this business.` };
  }

  // 3. Add to target user's business_invites
  const { data: targetAdminUser } = await adminClient.auth.admin.getUserById(targetUserId);
  const targetMeta = targetAdminUser?.user?.user_metadata || {};
  const targetInvites = Array.isArray(targetMeta.business_invites) ? [...targetMeta.business_invites] : [];

  // Prevent duplicate pending invites
  const existingInvite = targetInvites.find((i: any) => i.page_slug === pageSlug && i.status === 'pending');
  if (existingInvite) {
    return { error: `An invitation has already been sent to @${resolvedUsername}.` };
  }

  const inviteId = `inv_${Date.now()}`;
  const inviterName = ownerMeta.username || user.email?.split('@')[0] || 'A business owner';

  targetInvites.unshift({
    id: inviteId,
    page_slug: page.slug,
    page_name: page.name,
    inviter_username: inviterName,
    inviter_id: user.id,
    invited_at: new Date().toISOString(),
    status: 'pending',
  });

  await adminClient.auth.admin.updateUserById(targetUserId, {
    user_metadata: {
      ...targetMeta,
      business_invites: targetInvites,
    },
  });

  // 4. Record pending invite on page
  const pendingInvites = Array.isArray(page.pending_invites) ? [...page.pending_invites] : [];
  pendingInvites.push({
    username: resolvedUsername,
    user_id: targetUserId,
    invited_at: new Date().toISOString(),
  });

  businessPages[pageIdx] = {
    ...page,
    pending_invites: pendingInvites,
  };

  await adminClient.auth.admin.updateUserById(user.id, {
    user_metadata: {
      ...ownerMeta,
      business_pages: businessPages,
    },
  });

  invalidateBusinessPagesCache();
  revalidatePath(`/page/${pageSlug}`);
  revalidatePath('/my-listme');
  return { success: true, message: `Invitation sent to @${resolvedUsername}!` };
}

/**
 * Responds to a business invitation (Accept or Decline).
 */
export async function respondToBusinessInvitationAction(inviteId: string, accept: boolean) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { error: 'You must be logged in.' };
  }

  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!serviceKey || !supabaseUrl) return { error: 'Server configuration error.' };

  const adminClient = createAdminClient(supabaseUrl, serviceKey, { auth: { persistSession: false } });

  const { data: adminUser } = await adminClient.auth.admin.getUserById(user.id);
  const userMeta = adminUser?.user?.user_metadata || {};
  const invites = Array.isArray(userMeta.business_invites) ? [...userMeta.business_invites] : [];

  const inviteIdx = invites.findIndex((i: any) => i.id === inviteId);
  if (inviteIdx < 0) {
    return { error: 'Invitation not found or already processed.' };
  }

  const invite = invites[inviteIdx];

  if (accept) {
    // 1. Find the business page and its owner
    const inviterId = invite.inviter_id;
    if (inviterId) {
      const { data: ownerUser } = await adminClient.auth.admin.getUserById(inviterId);
      const ownerMeta = ownerUser?.user?.user_metadata || {};
      const ownerPages: BusinessPageData[] = ownerMeta.business_pages || [];
      const pIdx = ownerPages.findIndex((p) => p.slug === invite.page_slug);

      if (pIdx >= 0) {
        const page = ownerPages[pIdx];
        const teamMembers = Array.isArray(page.team_members) ? [...page.team_members] : [];
        const currentMemberUsername = userMeta.username || user.email?.split('@')[0] || 'Team Member';
        
        const alreadyExists = teamMembers.some((m: any) => 
          (typeof m === 'string' && m === user.id) || (typeof m === 'object' && m?.user_id === user.id)
        );

        if (!alreadyExists) {
          teamMembers.push({
            user_id: user.id,
            username: currentMemberUsername,
            role: 'team_member',
            joined_at: new Date().toISOString(),
          });
        }

        const pending = (page.pending_invites || []).filter(
          (pi: any) => pi.user_id !== user.id && pi.username?.toLowerCase() !== currentMemberUsername.toLowerCase()
        );

        ownerPages[pIdx] = {
          ...page,
          team_members: teamMembers,
          pending_invites: pending,
        };

        await adminClient.auth.admin.updateUserById(inviterId, {
          user_metadata: {
            ...ownerMeta,
            business_pages: ownerPages,
          },
        });
      }
    }

    // 2. Add to accepted user's assigned_business_pages
    const assigned = Array.isArray(userMeta.assigned_business_pages) ? [...userMeta.assigned_business_pages] : [];
    if (!assigned.some((ap: any) => ap.slug === invite.page_slug)) {
      assigned.push({
        slug: invite.page_slug,
        name: invite.page_name,
        role: 'team_member',
        joined_at: new Date().toISOString(),
      });
    }

    // Remove invite from pending
    invites.splice(inviteIdx, 1);

    await adminClient.auth.admin.updateUserById(user.id, {
      user_metadata: {
        ...userMeta,
        business_invites: invites,
        assigned_business_pages: assigned,
      },
    });
  } else {
    // Declined: remove invite
    invites.splice(inviteIdx, 1);
    await adminClient.auth.admin.updateUserById(user.id, {
      user_metadata: {
        ...userMeta,
        business_invites: invites,
      },
    });
  }

  invalidateBusinessPagesCache();
  revalidatePath('/my-listme');
  revalidatePath(`/page/${invite.page_slug}`);
  return { success: true, accepted: accept };
}

/**
 * Removes a member from a business page's team (either by the owner or self-leaving).
 */
export async function removeBusinessTeamMemberAction(pageSlug: string, memberUserId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { error: 'You must be signed in.' };
  }

  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!serviceKey || !supabaseUrl) return { error: 'Server configuration error.' };

  const adminClient = createAdminClient(supabaseUrl, serviceKey, { auth: { persistSession: false } });

  // 1. Check if caller is owner or removing themselves
  const allPages = await getAllRegisteredBusinessPages();
  const page = allPages.find((p) => p.slug === pageSlug);
  if (!page) {
    return { error: 'Business page not found.' };
  }

  const userIsAdmin = isAdmin(user);
  const isOwner = page.owner_id === user.id || (page.slug === 'listme' && userIsAdmin);
  const isSelf = user.id === memberUserId;

  if (!isOwner && !userIsAdmin && !isSelf) {
    return { error: 'Only the business page owner can remove team members.' };
  }

  // 2. Remove member from owner's page
  if (page.owner_id) {
    const { data: ownerUser } = await adminClient.auth.admin.getUserById(page.owner_id);
    const ownerMeta = ownerUser?.user?.user_metadata || {};
    const ownerPages: BusinessPageData[] = ownerMeta.business_pages || [];
    const pIdx = ownerPages.findIndex((p) => p.slug === pageSlug);

    if (pIdx >= 0) {
      const curPage = ownerPages[pIdx];
      const updatedMembers = (curPage.team_members || []).filter((m: any) => {
        const uid = typeof m === 'string' ? m : m?.user_id;
        return uid !== memberUserId;
      });

      ownerPages[pIdx] = {
        ...curPage,
        team_members: updatedMembers,
      };

      await adminClient.auth.admin.updateUserById(page.owner_id, {
        user_metadata: {
          ...ownerMeta,
          business_pages: ownerPages,
        },
      });
    }
  }

  // 3. Remove assigned page from member's user_metadata
  const { data: memberUser } = await adminClient.auth.admin.getUserById(memberUserId);
  if (memberUser?.user) {
    const memberMeta = memberUser.user.user_metadata || {};
    const assigned = (memberMeta.assigned_business_pages || []).filter((ap: any) => ap.slug !== pageSlug);
    await adminClient.auth.admin.updateUserById(memberUserId, {
      user_metadata: {
        ...memberMeta,
        assigned_business_pages: assigned,
      },
    });
  }

  invalidateBusinessPagesCache();
  revalidatePath('/my-listme');
  revalidatePath(`/page/${pageSlug}`);
  return { success: true };
}



