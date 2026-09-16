import { type NextRequest } from 'next/server'
import { updateSession } from '@/utils/supabase/middleware'

try {
  const dns = require('node:dns');
  dns.setDefaultResultOrder('ipv4first');
} catch (e) {}

export const runtime = 'nodejs';

export async function middleware(request: NextRequest) {
  return await updateSession(request)
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|txt)$).*)',
  ],
}
