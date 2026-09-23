'use server';

import { createClient } from '@/utils/supabase/server';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { revalidatePath } from 'next/cache';
import { validatePhoneNumber } from '@/utils/phoneValidation';
import { calculateServiceFee } from '@/utils/serviceFee';
import { getMemberNumber } from '@/utils/irelandLocations';

export async function updateAccountType(newType: 'personal' | 'business') {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return { error: 'Not authenticated' };
    }

    if (newType === 'business') {
      const userPhone = user.user_metadata?.phone || user.phone;
      if (!userPhone || !userPhone.trim()) {
        return {
          error: 'A phone number is required before switching to a Business account.',
          requiresPhone: true
        };
      }
      const phoneVal = validatePhoneNumber(userPhone);
      if (!phoneVal.isValid) {
        return {
          error: 'A valid phone number format is required before switching to a Business account.',
          requiresPhone: true
        };
      }
    }

    let updateError: string | null = null;

    if (process.env.SUPABASE_SERVICE_ROLE_KEY && process.env.NEXT_PUBLIC_SUPABASE_URL) {
      const adminClient = createSupabaseClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.SUPABASE_SERVICE_ROLE_KEY,
        { auth: { persistSession: false, autoRefreshToken: false } }
      );

      const [profRes] = await Promise.all([
        adminClient
          .from('profiles')
          .update({
            account_type: newType,
            updated_at: new Date().toISOString()
          })
          .eq('id', user.id),
        adminClient.auth.admin.updateUserById(user.id, {
          user_metadata: {
            ...(user.user_metadata || {}),
            account_type: newType,
          }
        })
      ]);

      if (profRes.error) {
        updateError = profRes.error.message;
      }
    } else {
      const { error } = await supabase
        .from('profiles')
        .update({
          account_type: newType,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);
      if (error) updateError = error.message;

      await supabase.auth.updateUser({
        data: { account_type: newType }
      });
    }

    if (updateError) {
      return { error: updateError };
    }

    revalidatePath('/my-listme');
    revalidatePath(`/member/${getMemberNumber(user.id)}`);
    revalidatePath(`/member/${user.id}`);
    return { success: true };
  } catch (err: any) {
    console.error('updateAccountType failure:', err);
    return { error: err.message || 'Failed to update account type. Please try again.' };
  }
}

export async function upgradeToBusinessWithPhone(phone: string) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return { error: 'Not authenticated' };
    }

    const phoneValidation = validatePhoneNumber(phone);
    if (!phoneValidation.isValid) {
      return { error: phoneValidation.error || 'Please enter a valid phone number format.' };
    }

    const normalizedPhone = phoneValidation.e164 || phone.trim();

    if (process.env.SUPABASE_SERVICE_ROLE_KEY && process.env.NEXT_PUBLIC_SUPABASE_URL) {
      const adminClient = createSupabaseClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.SUPABASE_SERVICE_ROLE_KEY,
        { auth: { persistSession: false, autoRefreshToken: false } }
      );

      await Promise.all([
        adminClient.from('profiles').update({
          account_type: 'business',
          updated_at: new Date().toISOString()
        }).eq('id', user.id),
        adminClient.auth.admin.updateUserById(user.id, {
          user_metadata: {
            ...(user.user_metadata || {}),
            phone: normalizedPhone,
            account_type: 'business',
          }
        })
      ]);
    } else {
      await supabase.auth.updateUser({
        data: {
          phone: normalizedPhone,
          account_type: 'business',
        }
      });
      await supabase
        .from('profiles')
        .update({
          account_type: 'business',
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);
    }

    revalidatePath('/my-listme');
    revalidatePath(`/member/${getMemberNumber(user.id)}`);
    revalidatePath(`/member/${user.id}`);

    return { success: true };
  } catch (err: any) {
    console.error('upgradeToBusinessWithPhone failure:', err);
    return { error: err.message || 'Failed to upgrade to business account.' };
  }
}

export interface ProfileData {
  username?: string;
  fullName?: string;
  avatarUrl?: string;
  phone?: string;
  location?: string;
}

export async function updateProfileSettings(data: ProfileData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { error: 'Not authenticated' };
  }

  const trimmedUsername = data.username?.trim();
  const trimmedFullName = data.fullName?.trim();
  const trimmedPhone = data.phone?.trim();
  const trimmedLocation = data.location?.trim();
  const avatarUrl = data.avatarUrl?.trim() || '';

  // Validate phone format if provided
  let normalizedPhoneToSave = trimmedPhone;
  if (trimmedPhone) {
    const phoneValidation = validatePhoneNumber(trimmedPhone);
    if (!phoneValidation.isValid) {
      return { error: phoneValidation.error || 'Please enter a valid phone number format.' };
    }
    normalizedPhoneToSave = phoneValidation.e164 || trimmedPhone;
  }

  // Check if current user is a business account
  const { data: currentProfile } = await supabase
    .from('profiles')
    .select('id, account_type')
    .eq('id', user.id)
    .maybeSingle();

  if (currentProfile?.account_type === 'business') {
    const existingPhone = user.user_metadata?.phone || user.phone;
    const finalPhone = normalizedPhoneToSave !== undefined ? normalizedPhoneToSave : existingPhone;
    if (!finalPhone) {
      return { error: 'A valid phone number is required for business accounts and cannot be removed.' };
    }
    const phoneValidation = validatePhoneNumber(finalPhone);
    if (!phoneValidation.isValid) {
      return { error: 'A valid phone number format is required for business accounts.' };
    }
  }

  // 1. If username is being changed, verify it is unique
  if (trimmedUsername) {
    const { data: existingProfile } = await supabase
      .from('profiles')
      .select('id')
      .ilike('username', trimmedUsername)
      .neq('id', user.id)
      .maybeSingle();

    if (existingProfile) {
      return { error: 'This username is already taken. Please choose another one.' };
    }
  }

  // 2. Update user_metadata in Supabase Auth
  const { error: authError } = await supabase.auth.updateUser({
    data: {
      username: trimmedUsername || undefined,
      full_name: trimmedFullName || undefined,
      avatar_url: avatarUrl || undefined,
      phone: normalizedPhoneToSave !== undefined ? normalizedPhoneToSave : undefined,
      location: trimmedLocation !== undefined ? trimmedLocation : undefined,
    }
  });

  if (authError) {
    console.error('Error updating auth user metadata:', authError);
    return { error: authError.message };
  }

  // 3. Synchronize username and avatar_url with public.profiles
  const profileUpdates: Record<string, any> = {
    updated_at: new Date().toISOString(),
  };
  if (trimmedUsername) {
    profileUpdates.username = trimmedUsername;
  }
  // Persist avatar_url directly in database table so it appears across all devices
  profileUpdates.avatar_url = avatarUrl || null;

  const { error: profileError } = await supabase
    .from('profiles')
    .update(profileUpdates)
    .eq('id', user.id);

  if (profileError) {
    console.error('Error updating profiles table:', profileError);
    // If avatar_url column does not exist yet in Supabase schema, fall back gracefully
    if (profileError.message?.includes('avatar_url') || profileError.message?.includes('schema cache')) {
      delete profileUpdates.avatar_url;
      if (Object.keys(profileUpdates).length > 0) {
        await supabase
          .from('profiles')
          .update(profileUpdates)
          .eq('id', user.id);
      }
    }
  }

  revalidatePath('/my-listme');
  revalidatePath('/my-listme', 'layout');
  revalidatePath('/', 'layout');

  return { success: true };
}

export async function uploadAvatarAction(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { error: 'Not authenticated' };
  }

  const file = formData.get('avatar') as File | null;
  if (!file) {
    return { error: 'No file provided' };
  }

  const isImageMime = file.type?.startsWith('image/');
  const isImageExt = file.name?.match(/\.(jpg|jpeg|png|webp|gif|heic|heif|jfif|bmp)$/i);
  if (!isImageMime && !isImageExt) {
    return { error: 'Uploaded file must be an image' };
  }

  // Max 10MB
  if (file.size > 10 * 1024 * 1024) {
    return { error: 'Image file size must be under 10MB' };
  }

  const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg';
  const filePath = `avatars/${user.id}-${Date.now()}.${ext}`;

  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const adminClient = serviceRoleKey
    ? createSupabaseClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, serviceRoleKey)
    : supabase;

  const buffer = Buffer.from(await file.arrayBuffer());

  const { error: uploadError } = await adminClient.storage
    .from('listing-images')
    .upload(filePath, buffer, {
      contentType: file.type || 'image/jpeg',
      upsert: true,
    });

  if (uploadError) {
    console.error('Storage upload error:', uploadError);
    return { error: uploadError.message };
  }

  const { data: { publicUrl } } = adminClient.storage
    .from('listing-images')
    .getPublicUrl(filePath);

  return { success: true, publicUrl };
}

export async function getUserPaymentStateAction() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { isLoggedIn: false, credit: 0, userId: null };
  }

  return {
    isLoggedIn: true,
    userId: user.id,
    credit: typeof user.user_metadata?.account_credit === 'number' ? user.user_metadata.account_credit : 0,
  };
}

export async function payForListingAction(
  listingId: string,
  paymentMethod: 'account_credit'
) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { error: 'Please log in to complete your purchase.' };
  }

  if (!listingId) {
    return { error: 'Listing ID is required.' };
  }

  // 1. Fetch listing
  const { data: listing, error: listingError } = await supabase
    .from('listings')
    .select('id, title, price, seller_id, status')
    .eq('id', listingId)
    .single();

  if (listingError || !listing) {
    return { error: 'Listing not found or no longer available.' };
  }

  if (listing.seller_id === user.id) {
    return { error: 'You cannot purchase your own listing.' };
  }

  if (listing.status === 'closed') {
    return { error: 'This listing has already closed or been sold.' };
  }

  const priceNum = typeof listing.price === 'string'
    ? parseFloat(listing.price.replace(/[^0-9.]/g, '')) || 0
    : (Number(listing.price) || 0);

  const feeCalc = calculateServiceFee(priceNum, true);
  const totalAmount = feeCalc.total;

  const currentCredit = typeof user.user_metadata?.account_credit === 'number'
    ? user.user_metadata.account_credit
    : 0;

  // 2. Validate payment method (only account credit supported)
  if (paymentMethod !== 'account_credit') {
    return { error: 'Only account credit is supported for purchases. Please top up your account.' };
  }

  if (currentCredit < totalAmount) {
    return {
      error: `Insufficient Listme Account Credit. Total is €${totalAmount.toFixed(2)}, but you have €${currentCredit.toFixed(2)}. Please top up your account credit.`
    };
  }

  const newCredit = Math.round((currentCredit - totalAmount) * 100) / 100;
  const { error: deductError } = await supabase.auth.updateUser({
    data: {
      account_credit: newCredit,
    }
  });

  if (deductError) {
    return { error: 'Failed to deduct payment from account credit: ' + deductError.message };
  }

  // 3. Mark listing as closed (sold)
  await supabase
    .from('listings')
    .update({ status: 'closed' })
    .eq('id', listing.id);

  // 4. Create an automated confirmation message in the chat between buyer & seller
  try {
    const methodDescription = 'Listme Account Credit';

    const buyerName = user.user_metadata?.full_name || user.user_metadata?.username || 'Buyer';

    // Find or create conversation
    let convId: string | null = null;
    const { data: convs } = await supabase
      .from('conversations')
      .select('id')
      .eq('listing_id', listing.id)
      .or(`buyer_id.eq.${user.id},seller_id.eq.${user.id}`)
      .limit(1);

    if (convs && convs.length > 0) {
      convId = convs[0].id;
    } else {
      const { data: newConv } = await supabase
        .from('conversations')
        .insert({
          listing_id: listing.id,
          buyer_id: user.id,
          seller_id: listing.seller_id,
          last_message: `Payment of €${totalAmount.toFixed(2)} completed!`,
        })
        .select('id')
        .single();
      if (newConv) convId = newConv.id;
    }

    if (convId) {
      const messageText = `Payment confirmed! ${buyerName} purchased "${listing.title}" for €${totalAmount.toFixed(2)} using ${methodDescription}. Covered by Listme Buyer Protection (Up to €5,000). You can now arrange delivery or collection.`;
      await supabase.from('messages').insert({
        conversation_id: convId,
        sender_id: user.id,
        content: messageText,
        is_read: false,
      });
    }
  } catch (msgErr) {
    console.error('Non-critical error logging purchase message:', msgErr);
  }

  revalidatePath(`/listing/${listing.id}`);
  revalidatePath('/my-listme');
  return { success: true, listingId: listing.id, total: totalAmount };
}

export async function purchaseVerificationAction() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { error: 'Not authenticated' };
  }

  const currentCredit = Number(user.user_metadata?.account_credit || 0);
  const VERIFY_FEE = 9.99;
  let newCredit = currentCredit;
  if (currentCredit >= VERIFY_FEE) {
    newCredit = Math.round((currentCredit - VERIFY_FEE) * 100) / 100;
  }

  const { error: authError } = await supabase.auth.updateUser({
    data: {
      is_verified: true,
      verified_at: new Date().toISOString(),
      verification_type: 'subscription',
      account_credit: newCredit,
    }
  });

  if (authError) {
    return { error: authError.message };
  }

  try {
    await supabase
      .from('profiles')
      .update({ is_verified: true })
      .eq('id', user.id);
  } catch {
    // metadata is source of truth
  }

  revalidatePath('/my-listme');
  revalidatePath(`/member/${user.id}`);
  revalidatePath(`/member/${getMemberNumber(user.id)}`);
  return { success: true };
}
