import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const pathname = request.nextUrl.pathname;

  const isApiRoute = pathname.startsWith('/api/');
  const isAuthRoute = pathname.startsWith('/login') || pathname.startsWith('/register');
  const isOnboardingRoute = pathname.startsWith('/auth/setup-username');
  const isProtectedRoute = 
    pathname.startsWith('/my-listme') || 
    pathname.startsWith('/sell') || 
    pathname.startsWith('/messages') || 
    pathname.startsWith('/stripe-setup') || 
    pathname.startsWith('/wallet-setup');
  const isSignoutRoute = pathname.startsWith('/auth/signout');

  const hasAuthCookie = request.cookies.getAll().some(c => 
    c.name.includes('-auth-token')
  );

  if (!isAuthRoute && !isOnboardingRoute && !isProtectedRoute && !isSignoutRoute && (!isApiRoute || !hasAuthCookie)) {
    return supabaseResponse;
  }

  if (isAuthRoute && !hasAuthCookie) {
    return supabaseResponse;
  }

  if (isProtectedRoute && !hasAuthCookie) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    url.searchParams.set('next', pathname);
    return NextResponse.redirect(url);
  }

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user && isProtectedRoute) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    url.searchParams.set('next', pathname);
    return NextResponse.redirect(url)
  }

  if (user && !isSignoutRoute && !isApiRoute) {
    const username = user.user_metadata?.username;
    const isEmailUser = user.app_metadata?.provider === 'email' || user.app_metadata?.providers?.includes('email');
    const hasPassword = isEmailUser || Boolean(user.user_metadata?.has_password);
    
    if ((!username || !hasPassword) && !isOnboardingRoute) {
      const url = request.nextUrl.clone()
      url.pathname = '/auth/setup-username'
      return NextResponse.redirect(url)
    }

    if (username && hasPassword && (isAuthRoute || isOnboardingRoute)) {
       const url = request.nextUrl.clone()
       url.pathname = '/'
       return NextResponse.redirect(url)
    }
  }

  return supabaseResponse
}
