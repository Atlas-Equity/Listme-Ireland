import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

const JAVA_BACKEND_URL = process.env.JAVA_BACKEND_URL || 'http://localhost:8080';

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { session } } = await supabase.auth.getSession();

    if (!session?.access_token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const res = await fetch(`${JAVA_BACKEND_URL}/api/connect`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${session.access_token}`,
        'Content-Type': 'application/json'
      }
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Backend Error');

    return NextResponse.json(data);
  } catch (err: any) {
    console.error('Connect Proxy POST Error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
