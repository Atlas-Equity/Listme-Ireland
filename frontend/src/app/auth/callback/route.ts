import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { type EmailOtpType } from '@supabase/supabase-js';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const token_hash = searchParams.get('token_hash');
  const type = searchParams.get('type') as EmailOtpType | null;
  const next = searchParams.get('next') ?? '/';

  const forwardedHost = request.headers.get('x-forwarded-host');
  const isLocalEnv = process.env.NODE_ENV === 'development';
  const redirectBase = isLocalEnv 
    ? origin 
    : (forwardedHost ? `https://${forwardedHost}` : origin);

  const supabase = await createClient();

  const handlePostAuth = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return NextResponse.redirect(`${redirectBase}${next}`);
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('id, username')
        .eq('id', user.id)
        .maybeSingle();

      if (!profile) {
        // Ensure profile row exists
        await supabase.from('profiles').insert({
          id: user.id,
          email: user.email,
          account_type: 'personal',
          avatar_url: user.user_metadata?.avatar_url || null,
        });
        return NextResponse.redirect(
          `${redirectBase}/auth/setup-username${next !== '/' ? `?next=${encodeURIComponent(next)}` : ''}`
        );
      }

      if (!profile.username) {
        return NextResponse.redirect(
          `${redirectBase}/auth/setup-username${next !== '/' ? `?next=${encodeURIComponent(next)}` : ''}`
        );
      }

      return NextResponse.redirect(`${redirectBase}${next}`);
    } catch (err) {
      console.error('Error checking profile post-auth:', err);
      return NextResponse.redirect(`${redirectBase}${next}`);
    }
  };

  // 1. OAuth code exchange (Google, etc.)
  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return await handlePostAuth();
    }
    console.error('OAuth code exchange error:', error);
  }

  // 2. Email link verification (Magic link, OTP token hash)
  if (token_hash && type) {
    const { error } = await supabase.auth.verifyOtp({
      type,
      token_hash,
    });
    if (!error) {
      return await handlePostAuth();
    }
    console.error('Token hash OTP verification error:', error);
  }

  // Fallback: return to auth error page
  return NextResponse.redirect(`${redirectBase}/auth/auth-code-error`);
}
