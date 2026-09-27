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
    const recipientName =
      existingUser.user_metadata?.full_name ||
      existingUser.user_metadata?.username ||
      email.split('@')[0];

    try {
      const templateId = process.env.RESEND_TEMPLATE_ID || '585471a8-8cc2-4390-b106-0d55ae655b7a';
      const emailPayload: Record<string, any> = {
        from: fromEmail,
        to: [email],
        subject: `${otpCode} is your ListMe.ie verification code`,
      };

      if (templateId) {
        emailPayload.template = {
          id: templateId,
          variables: {
            pin: otpCode,
            name: recipientName,
            code: otpCode,
            otpCode: otpCode,
            otp: otpCode,
          },
        };
      } else {
        emailPayload.html = `
<!DOCTYPE html>
<html dir="ltr" lang="en">
  <head>
    <meta content="width=device-width" name="viewport" />
    <meta content="text/html; charset=UTF-8" http-equiv="Content-Type" />
    <meta name="x-apple-disable-message-reformatting" />
    <meta content="IE=edge" http-equiv="X-UA-Compatible" />
    <meta content="telephone=no,address=no,email=no,date=no,url=no" name="format-detection" />
    <title>Your ListMe.ie verification code</title>
    <style>
      @media (prefers-color-scheme: dark) {
        li::marker { color: #c4c4c4; }
      }
      a { color: #22c55e; }
      a:hover { color: #16a34a; }
    </style>
  </head>
  <body
    dir="ltr"
    lang="en"
    style="background-color:#f8fafc;margin:0;padding-top:40px;padding-bottom:40px;padding-right:16px;padding-left:16px;font-family:-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif;font-size:1em;line-height:155%;"
  >
    <div
      style="display:none;font-size:1px;color:#f8fafc;line-height:1px;max-height:0;max-width:0;opacity:0;overflow:hidden;"
    >
      Enter this code to verify your email. Expires in 10 minutes.
    </div>

    <table border="0" width="100%" cellpadding="0" cellspacing="0" role="presentation" align="center">
      <tbody>
        <tr>
          <td align="center" style="padding-left:0;padding-right:0;">
            <table
              align="center"
              width="100%"
              border="0"
              cellpadding="0"
              cellspacing="0"
              role="presentation"
              style="max-width:600px;width:100%;background-color:#ffffff;border:1px solid #e5e7eb;border-radius:12px;overflow:hidden;line-height:155%;"
            >
              <tbody>
                <tr style="width:100%">
                  <td style="padding-top:32px;padding-right:24px;padding-bottom:0;padding-left:24px;">
                    <p style="margin:0;padding:0;font-size:18px;font-weight:bold;color:#18181b;letter-spacing:-0.2px;">
                      ListMe.ie
                    </p>
                    <p style="margin:4px 0 0 0;padding:0;font-size:12px;color:#71717a;">
                      Irish Owned. Irish Operated. Community First.
                    </p>
                  </td>
                </tr>

                <tr style="width:100%">
                  <td
                    style="padding-top:24px;padding-right:24px;padding-bottom:32px;padding-left:24px;font-size:15px;line-height:1.6;color:#3f3f46;"
                  >
                    <h1
                      style="margin:0 0 16px 0;padding:0;font-size:22px;font-weight:bold;color:#18181b;letter-spacing:-0.3px;"
                    >
                      Verify your email
                    </h1>

                    <p style="margin:0 0 16px 0;padding:0;">Hi ${recipientName},</p>

                    <p style="margin:0 0 24px 0;padding:0;">
                      Use the code below to finish setting up your ListMe.ie account.
                    </p>

                    <table
                      border="0"
                      cellpadding="0"
                      cellspacing="0"
                      role="presentation"
                      align="center"
                      style="margin:0 auto 24px auto;width:100%;"
                    >
                      <tbody>
                        <tr>
                          <td
                            align="center"
                            style="padding:24px 16px;background-color:#f0fdf4;border:1px solid #bbf7d0;border-radius:12px;font-size:36px;font-weight:bold;letter-spacing:8px;color:#166534;font-family:'SF Mono', Monaco, 'Courier New', monospace;"
                          >
                            ${otpCode}
                          </td>
                        </tr>
                      </tbody>
                    </table>

                    <p style="margin:0 0 16px 0;padding:0;text-align:center;font-size:13px;color:#71717a;">
                      This code expires in 10 minutes.
                    </p>

                    <p style="margin:0 0 16px 0;padding:0;">
                      Enter this code on the verification screen to activate your account.
                    </p>

                    <p style="margin:0 0 16px 0;padding:0;">
                      If you didn't create a ListMe.ie account, you can safely ignore this email. Your email address
                      will not be added to any list.
                    </p>

                    <p style="margin:0;padding:0;">
                      Slán,
                      <br />
                      The ListMe.ie Team
                    </p>
                  </td>
                </tr>

                <tr style="width:100%">
                  <td style="padding-top:0;padding-right:24px;padding-bottom:0;padding-left:24px;">
                    <hr style="border:none;border-top:1px solid #e5e7eb;margin:0;" />
                  </td>
                </tr>

                <tr style="width:100%">
                  <td
                    style="padding-top:24px;padding-right:24px;padding-bottom:32px;padding-left:24px;font-size:12px;line-height:1.6;color:#71717a;"
                  >
                    <p style="margin:0 0 8px 0;padding:0;">
                      Need help? Create a support ticket at
                      <a href="https://www.listme.ie/help" style="color:#22c55e;text-decoration:none;font-weight:600;">
                        listme.ie/help
                      </a>
                    </p>
                    <p style="margin:0 0 16px 0;padding:0;">Every ticket is handled by a real human. No AI, no bots.</p>

                    <p style="margin:0 0 12px 0;padding:0;">
                      <a href="https://www.listme.ie/about" style="color:#71717a;text-decoration:underline;">About Us</a>
                      &nbsp;·&nbsp;
                      <a href="https://www.listme.ie/terms" style="color:#71717a;text-decoration:underline;">Terms of Service</a>
                      &nbsp;·&nbsp;
                      <a href="https://www.listme.ie/privacy" style="color:#71717a;text-decoration:underline;">Privacy Policy</a>
                      &nbsp;·&nbsp;
                      <a href="https://www.listme.ie/buyer-protection" style="color:#71717a;text-decoration:underline;">Buyer Protection</a>
                    </p>

                    <p style="margin:0;padding:0;font-size:11px;color:#a1a1aa;">
                      ListMe.ie · Ireland · Irish Owned. Irish Operated. Community First.
                    </p>
                  </td>
                </tr>
              </tbody>
            </table>
          </td>
        </tr>
      </tbody>
    </table>
  </body>
</html>
        `;
      }

      const resendRes = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${resendApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(emailPayload),
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

