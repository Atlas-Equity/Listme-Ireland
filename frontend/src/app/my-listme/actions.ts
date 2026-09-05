'use server';

import { createClient } from '@/utils/supabase/server';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { revalidatePath } from 'next/cache';

export async function updateAccountType(newType: 'personal' | 'business') {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { error: 'Not authenticated' };
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
      phone: trimmedPhone !== undefined ? trimmedPhone : undefined,
      location: trimmedLocation !== undefined ? trimmedLocation : undefined,
    }
  });

  if (authError) {
    console.error('Error updating auth user metadata:', authError);
    return { error: authError.message };
  }

  // 3. Synchronize username with public.profiles
  if (trimmedUsername) {
    const { error: profileError } = await supabase
      .from('profiles')
      .update({ username: trimmedUsername, updated_at: new Date().toISOString() })
      .eq('id', user.id);

    if (profileError) {
      console.error('Error updating profiles table username:', profileError);
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

  if (!file.type.startsWith('image/')) {
    return { error: 'Uploaded file must be an image' };
  }

  // Max 5MB
  if (file.size > 5 * 1024 * 1024) {
    return { error: 'Image file size must be under 5MB' };
  }

  const ext = file.name.split('.').pop() || 'jpg';
  const filePath = `avatars/${user.id}-${Date.now()}.${ext}`;

  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const adminClient = serviceRoleKey
    ? createSupabaseClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, serviceRoleKey)
    : supabase;

  const buffer = Buffer.from(await file.arrayBuffer());

  const { error: uploadError } = await adminClient.storage
    .from('listing-images')
    .upload(filePath, buffer, {
      contentType: file.type,
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
