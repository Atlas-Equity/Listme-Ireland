'use server'

import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'

export async function loginWithUsernameOrEmail(identifier: string, password: string) {
  let email = identifier;

  if (!identifier.includes('@')) {
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    if (!serviceRoleKey) {
      return { error: 'Username login is not configured on the server (Missing SERVICE_ROLE_KEY)' };
    }

    const adminSupabase = createSupabaseClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      serviceRoleKey
    );

    const { data, error } = await adminSupabase
      .from('profiles')
      .select('email')
      .eq('username', identifier)
      .single();

    if (error || !data?.email) {
      return { error: 'Invalid login credentials' };
    }

    email = data.email;
  }

  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch (error) {}
        },
      },
    }
  );

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return { error: error.message };
  }

  return { success: true };
}

export async function requestLoginOtpAction(identifier: string) {
  const trimmed = (identifier || '').trim();
  if (!trimmed) {
    return { error: 'Please enter your email or username.' };
  }

  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

  if (!serviceRoleKey || !supabaseUrl) {
    return { error: 'Server authentication configuration is missing.' };
  }

  const adminSupabase = createSupabaseClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  let email = trimmed.toLowerCase();

  // If user entered username instead of email, resolve it
  if (!trimmed.includes('@')) {
    const { data: profile, error: profError } = await adminSupabase
      .from('profiles')
      .select('email')
      .ilike('username', trimmed)
      .maybeSingle();

    if (profError || !profile?.email) {
      return { error: `No account found with username "${trimmed}". Please check the spelling or sign up.` };
    }
    email = profile.email.toLowerCase();
  }

  // Check if account exists in auth.users
  const { data: usersData, error: listError } = await adminSupabase.auth.admin.listUsers();
  if (listError) {
    return { error: 'Unable to verify account status at this time.' };
  }

  const existingUser = usersData?.users?.find(
    (u) => u.email?.toLowerCase() === email
  );

  if (!existingUser) {
    return { error: `No ListMe account found for "${email}". Please sign up first.` };
  }

  // Ensure email is marked confirmed so Supabase does not silently drop the OTP
  if (!existingUser.email_confirmed_at) {
    try {
      await adminSupabase.auth.admin.updateUserById(existingUser.id, {
        email_confirm: true,
      });
    } catch {}
  }

  // Check if Resend API key is available
  const resendApiKey = process.env.RESEND_API_KEY;
  if (resendApiKey) {
    const genRes = await adminSupabase.auth.admin.generateLink({
      type: 'magiclink',
      email: email,
    });

    if (genRes.error || !genRes.data?.properties?.email_otp) {
      return { error: genRes.error?.message || 'Failed to generate verification code.' };
    }

    const otpCode = genRes.data.properties.email_otp;
    const fromEmail = process.env.RESEND_FROM_EMAIL || 'ListMe <auth@listme.ie>';

    try {
      const resendRes = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${resendApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: fromEmail,
          to: [email],
          subject: `${otpCode} is your ListMe login code`,
          html: `
            <div style="font-family: Arial, Helvetica, sans-serif; max-width: 520px; margin: 0 auto; padding: 32px 24px; background-color: #121212; color: #f4f4f5; border-radius: 12px; border: 1px solid #27272a;">
              <h2 style="font-size: 20px; font-weight: bold; margin-bottom: 8px; color: #ffffff;">Log in to ListMe</h2>
              <p style="font-size: 14px; color: #a1a1aa; margin-bottom: 24px;">Use the verification code below to sign in to your ListMe account. This code expires in 10 minutes.</p>
              <div style="background-color: #18181b; border: 1px solid #3f3f46; border-radius: 8px; padding: 18px; text-align: center; margin-bottom: 24px;">
                <span style="font-family: monospace; font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #22c55e;">${otpCode}</span>
              </div>
              <p style="font-size: 12px; color: #71717a; margin-bottom: 0;">If you did not request this code, you can safely ignore this email.</p>
            </div>
          `,
        }),
      });

      if (!resendRes.ok) {
        const errText = await resendRes.text();
        console.error('Resend delivery error:', errText);
      } else {
        return {
          success: true,
          email: email,
          devCode: process.env.NODE_ENV !== 'production' ? otpCode : undefined,
        };
      }
    } catch (e: any) {
      console.error('Resend fetch error:', e);
    }
  }

  // Development environment: generate OTP directly to prevent local lockout from Supabase 3/hr rate limits
  if (process.env.NODE_ENV !== 'production') {
    const genRes = await adminSupabase.auth.admin.generateLink({
      type: 'magiclink',
      email: email,
    });

    if (genRes.error || !genRes.data?.properties?.email_otp) {
      return { error: genRes.error?.message || 'Failed to generate code in development.' };
    }

    const otpCode = genRes.data.properties.email_otp;
    console.log(`[ListMe OTP Dev] Login code for ${email}: ${otpCode}`);

    return {
      success: true,
      email: email,
      devCode: otpCode,
    };
  }

  // Production fallback: Standard Supabase client trigger
  const anonSupabase = createSupabaseClient(
    supabaseUrl,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const { error: otpError } = await anonSupabase.auth.signInWithOtp({
    email: email,
  });

  if (otpError) {
    return { error: otpError.message };
  }

  return { success: true, email: email };
}

