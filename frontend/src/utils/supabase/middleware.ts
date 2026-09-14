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

  // Check if any supabase auth cookie exists
  const hasAuthCookie = request.cookies.getAll().some(c => 
    c.name.includes('-auth-token')
  );

  // Fast path: for public browsing routes (homepage, categories, search, listing view),
  // if no auth cookie exists, do not block page navigation on a remote Supabase Auth network call!
  if (!isAuthRoute && !isOnboardingRoute && !isProtectedRoute && !isSignoutRoute && (!isApiRoute || !hasAuthCookie)) {
    return supabaseResponse;
  }

  // If on an auth route and no auth cookie is present, allow immediate render without remote call
  if (isAuthRoute && !hasAuthCookie) {
    return supabaseResponse;
  }

  // If on a protected route and no auth cookie is present, redirect to login immediately
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

  // If user is logged in, check if they have completed username setup (only for UI pages, never API calls)
  if (user && !isSignoutRoute && !isApiRoute) {
    const username = user.user_metadata?.username;
    
    // If they don't have a username and aren't already on the setup-username page, redirect them
    if (!username && !isOnboardingRoute) {
      const url = request.nextUrl.clone()
      url.pathname = '/auth/setup-username'
      return NextResponse.redirect(url)
    }

    // If they do have a username and try to access login/register/setup-username, send them home
    if (username && (isAuthRoute || isOnboardingRoute)) {
       const url = request.nextUrl.clone()
       url.pathname = '/'
       return NextResponse.redirect(url)
    }
  }

  return supabaseResponse
}
