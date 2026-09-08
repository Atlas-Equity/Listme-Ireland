'use server';

import { createClient } from '@/utils/supabase/server';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { revalidatePath } from 'next/cache';
import { validatePhoneNumber } from '@/utils/phoneValidation';

export async function updateAccountType(newType: 'personal' | 'business') {
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

  const { error } = await supabase
    .from('profiles')
    .update({ account_type: newType })
    .eq('id', user.id);

  if (error) {
    return { error: error.message };
  }

  // Revalidate the profile page so it shows the new data
  revalidatePath('/my-listme');
  return { success: true };
}

export async function upgradeToBusinessWithPhone(phone: string) {
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

  // 1. Update user_metadata with the phone number
  const { error: authError } = await supabase.auth.updateUser({
    data: {
      phone: normalizedPhone,
    }
  });

  if (authError) {
    return { error: authError.message };
  }

  // 2. Upgrade account_type to 'business'
  const { error: profileError } = await supabase
    .from('profiles')
    .update({ 
      account_type: 'business',
      updated_at: new Date().toISOString() 
    })
    .eq('id', user.id);

  if (profileError) {
    return { error: profileError.message };
  }

  revalidatePath('/my-listme');
  revalidatePath('/my-listme', 'layout');
  revalidatePath('/', 'layout');

  return { success: true };
}

export interface ProfileData {
  username?: string;
  fullName?: string;
  bio?: string;
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
  const trimmedBio = data.bio?.trim();
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
      bio: trimmedBio !== undefined ? trimmedBio : undefined,
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
