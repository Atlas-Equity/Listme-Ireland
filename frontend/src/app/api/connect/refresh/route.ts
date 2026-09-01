import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  // If the user drops out of the onboarding flow, Stripe redirects here.
  // We just send them back to the onboarding start page.
  const origin = req.headers.get('origin') || process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
  return NextResponse.redirect(`${origin}/onboarding`);
}
