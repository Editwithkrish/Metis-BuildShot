import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
          response = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // This will refresh session if expired - required for Server Components
  // https://supabase.com/docs/guides/auth/server-side/nextjs
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // PROTECTED ROUTES LOGIC
  const isAuthPage = request.nextUrl.pathname.startsWith('/auth')
  const isOnboardingPage = request.nextUrl.pathname.startsWith('/onboarding')
  const isDashboardPage = request.nextUrl.pathname.startsWith('/dashboard')

  // If user is not logged in and trying to access protected routes
  if (!user && (isDashboardPage || isOnboardingPage)) {
    return NextResponse.redirect(new URL('/auth', request.url))
  }

  // If user is logged in
  if (user) {
    // 1. Prevent access to auth page if already logged in
    if (isAuthPage) {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }

    // 2. Onboarding logic: check if user has completed onboarding
    // Only check if they are NOT already on the onboarding page
    if (!isOnboardingPage) {
        const { data: profile } = await supabase
            .from('profiles')
            .select('onboarding_completed')
            .eq('id', user.id)
            .single()

        if (!profile || !profile.onboarding_completed) {
            return NextResponse.redirect(new URL('/onboarding', request.url))
        }
    }
  }

  return response
}
