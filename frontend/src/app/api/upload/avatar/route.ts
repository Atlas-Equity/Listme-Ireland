import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { createClient as createAdminClient } from '@supabase/supabase-js';

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'You must be logged in to upload an image.' }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get('avatar') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'No image file provided.' }, { status: 400 });
    }

    const isImageMime = file.type?.startsWith('image/');
    const isImageExt = file.name?.match(/\.(jpg|jpeg|png|webp|gif|heic|heif|jfif|bmp)$/i);
    if (!isImageMime && !isImageExt) {
      return NextResponse.json({ error: 'Uploaded file must be a valid image (JPG, PNG, WebP, HEIC).' }, { status: 400 });
    }

    const ext = file.name.split('.').pop()?.toLowerCase() || 'webp';
    const filePath = `avatars/${user.id}-${Date.now()}.${ext}`;

    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;

    if (!serviceRoleKey || !url) {
      return NextResponse.json({ error: 'Storage credentials not configured.' }, { status: 500 });
    }

    const adminClient = createAdminClient(url, serviceRoleKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });

    const buffer = Buffer.from(await file.arrayBuffer());

    const { error: uploadError } = await adminClient.storage
      .from('listing-images')
      .upload(filePath, buffer, {
        contentType: file.type || 'image/jpeg',
        upsert: true,
      });

    if (uploadError) {
      console.error('Storage upload error:', uploadError);
      return NextResponse.json({ error: uploadError.message }, { status: 500 });
    }

    const { data: { publicUrl } } = adminClient.storage
      .from('listing-images')
      .getPublicUrl(filePath);

    return NextResponse.json({ success: true, publicUrl });
  } catch (err: any) {
    console.error('Avatar upload route error:', err);
    return NextResponse.json({ error: err?.message || 'Failed to upload image.' }, { status: 500 });
  }
}
