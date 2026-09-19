import { NextRequest, NextResponse } from 'next/server';
import { getSellerMetaMap } from '@/utils/sellerMeta';

export const revalidate = 60;

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const idsParam = searchParams.get('ids') || searchParams.get('id');
  if (!idsParam) {
    return NextResponse.json({ error: 'Missing ids parameter' }, { status: 400 });
  }

  const ids = idsParam
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);

  if (ids.length === 0) {
    return NextResponse.json({});
  }

  const metaMap = await getSellerMetaMap(ids);
  const result: Record<string, any> = {};
  metaMap.forEach((meta, id) => {
    result[id] = meta;
  });

  return NextResponse.json(result);
}
