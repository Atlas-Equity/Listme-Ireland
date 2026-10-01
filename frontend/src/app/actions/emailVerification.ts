'use server';

import { createClient, createAdminClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';

export async function sendEmailVerificationCodeAction() {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user || !user.email) {
    return { success: false, error: 'You must be signed in to verify your email.' };
  }

  if (user.email_confirmed_at) {
    return { success: false, error: 'Your email is already verified.' };
  }

  const email = user.email.toLowerCase();
  const recipientName = user.user_metadata?.username || user.user_metadata?.full_name || email.split('@')[0] || 'Member';

  // Generate 6-digit numeric OTP
  const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes

  try {
    const adminSupabase = createAdminClient();

    // Store OTP in user_metadata temporarily
    await adminSupabase.auth.admin.updateUserById(user.id, {
      user_metadata: {
        ...user.user_metadata,
        pending_email_otp: otpCode,
        pending_email_otp_expires_at: expiresAt,
      },
    });

    const resendApiKey = process.env.RESEND_API_KEY;
    const templateId = '585471a8-8cc2-4390-b106-0d55ae655b7a';

    if (resendApiKey) {
      const emailPayload: any = {
        from: 'ListMe.ie <no-reply@listme.ie>',
        to: [email],
        subject: `${otpCode} is your ListMe verification code`,
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
    <title>Your ListMe.ie verification code</title>
  </head>
  <body style="background-color:#f8fafc;padding:32px;font-family:sans-serif;color:#18181b;">
    <div style="max-width:540px;margin:0 auto;background:#ffffff;border-radius:12px;padding:32px;border:1px solid #e5e7eb;">
      <h2 style="margin:0 0 16px 0;color:#18181b;font-size:22px;font-weight:bold;">Verify your email address</h2>
      <p style="font-size:15px;color:#3f3f46;margin-bottom:24px;">Hi ${recipientName}, use the verification code below to verify your ListMe.ie email address:</p>
      <div style="text-align:center;padding:20px;background:#f0fdf4;border:1px solid #bbf7d0;border-radius:12px;font-size:32px;letter-spacing:6px;font-weight:bold;color:#166534;font-family:monospace;">
        ${otpCode}
      </div>
      <p style="font-size:13px;color:#71717a;margin-top:24px;text-align:center;">This code expires in 10 minutes.</p>
    </div>
  </body>
</html>`;
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
        console.error('Failed to send verification email via Resend:', errText);
      }
    }

    return {
      success: true,
      email,
      devCode: process.env.NODE_ENV !== 'production' ? otpCode : undefined,
    };
  } catch (err: any) {
    console.error('Error generating verification code:', err);
    return { success: false, error: err.message || 'Failed to send verification code.' };
  }
}

export async function verifyEmailCodeAction(inputCode: string) {
  const code = (inputCode || '').trim();
  if (code.length < 6) {
    return { success: false, error: 'Please enter the 6-digit code.' };
  }

  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return { success: false, error: 'You must be signed in to verify your email.' };
  }

  const expectedCode = user.user_metadata?.pending_email_otp;
  const expiresAt = user.user_metadata?.pending_email_otp_expires_at;

  if (!expectedCode || !expiresAt) {
    return { success: false, error: 'No verification code requested. Please click Send Code first.' };
  }

  if (Date.now() > expiresAt) {
    return { success: false, error: 'Verification code has expired. Please request a new one.' };
  }

  if (code !== expectedCode) {
    return { success: false, error: 'Incorrect verification code. Please check your email and try again.' };
  }

  try {
    const adminSupabase = createAdminClient();

    // Confirm the email in Supabase auth
    const { error: updateError } = await adminSupabase.auth.admin.updateUserById(user.id, {
      email_confirm: true,
      user_metadata: {
        ...user.user_metadata,
        pending_email_otp: null,
        pending_email_otp_expires_at: null,
      },
    });

    if (updateError) {
      return { success: false, error: updateError.message || 'Failed to confirm email.' };
    }

    revalidatePath('/', 'layout');
    return { success: true };
  } catch (err: any) {
    console.error('Error confirming email:', err);
    return { success: false, error: err.message || 'Failed to verify email.' };
  }
}
