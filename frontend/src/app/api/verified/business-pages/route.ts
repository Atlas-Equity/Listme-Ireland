import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export interface UserBusinessPageItem {
  id?: string;
  name: string;
  slug: string;
  is_verified?: boolean;
  avatar_url?: string;
  category?: string;
}

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ authenticated: false, pages: [] });
    }

    const pagesMap = new Map<string, UserBusinessPageItem>();

    const metadataPages = (user.user_metadata?.business_pages || []) as any[];
    for (const p of metadataPages) {
      if (p && p.slug) {
        pagesMap.set(p.slug.toLowerCase(), {
          id: p.id,
          name: p.name || p.slug,
          slug: p.slug,
          is_verified: Boolean(p.is_verified),
          avatar_url: p.avatarUrl || p.avatar_url || '',
          category: p.category || '',
        });
      }
    }

    try {
      const { data: dbPages } = await supabase
        .from('business_pages')
        .select('id, name, slug, is_verified, avatar_url, category')
        .eq('owner_id', user.id);

      if (Array.isArray(dbPages)) {
        for (const p of dbPages) {
          if (p && p.slug) {
            pagesMap.set(p.slug.toLowerCase(), {
              id: p.id,
              name: p.name || p.slug,
              slug: p.slug,
              is_verified: Boolean(p.is_verified),
              avatar_url: p.avatar_url || '',
              category: p.category || '',
            });
          }
        }
      }
    } catch {}

    const pages = Array.from(pagesMap.values());

    return NextResponse.json({
      authenticated: true,
      pages,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || 'Failed to fetch business pages.' },
      { status: 500 }
    );
  }
}
