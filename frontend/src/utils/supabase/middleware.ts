import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
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

  // IMPORTANT: Avoid writing any logic between createServerClient and
  // supabase.auth.getUser(). A simple mistake could make it very hard to debug
  // issues with users being randomly logged out.

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const isAuthRoute = request.nextUrl.pathname.startsWith('/login') || request.nextUrl.pathname.startsWith('/register');
  const isOnboardingRoute = request.nextUrl.pathname.startsWith('/onboarding');
  const isSignoutRoute = request.nextUrl.pathname.startsWith('/auth/signout');

  if (
    !user &&
    request.nextUrl.pathname.startsWith('/my-listme')
  ) {
    // no user, potentially respond by redirecting the user to the login page
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  // If user is logged in, check if they have completed onboarding (have a username)
  if (user && !isSignoutRoute) {
    const username = user.user_metadata?.username;
    
    // If they don't have a username and aren't already on the onboarding page, redirect them
    if (!username && !isOnboardingRoute) {
      const url = request.nextUrl.clone()
      url.pathname = '/onboarding'
      return NextResponse.redirect(url)
    }

    // If they do have a username and try to access login/register/onboarding, send them home
    if (username && (isAuthRoute || isOnboardingRoute)) {
       const url = request.nextUrl.clone()
       url.pathname = '/'
       return NextResponse.redirect(url)
    }
  }

  return supabaseResponse
}
