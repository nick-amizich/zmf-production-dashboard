import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
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

  // Check authentication
  const { data: { user } } = await supabase.auth.getUser()

  const isAuthPage = request.nextUrl.pathname.startsWith('/login') || 
                     request.nextUrl.pathname.startsWith('/auth') ||
                     request.nextUrl.pathname.startsWith('/signup')
  
  const isPendingApprovalPage = request.nextUrl.pathname === '/pending-approval'
  
  // Protected routes
  const isProtectedRoute = !isAuthPage && 
                          !isPendingApprovalPage &&
                          !request.nextUrl.pathname.startsWith('/_next') &&
                          !request.nextUrl.pathname.startsWith('/api') &&
                          request.nextUrl.pathname !== '/'

  // Redirect to login if accessing protected route without auth
  if (!user && isProtectedRoute) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // Check worker approval status for authenticated users
  if (user && !isPendingApprovalPage && !isAuthPage) {
    const { data: worker } = await supabase
      .from('workers')
      .select('approval_status')
      .eq('auth_user_id', user.id)
      .single()

    // If worker exists and is not approved, redirect to pending approval page
    if (worker && worker.approval_status !== 'approved') {
      return NextResponse.redirect(new URL('/pending-approval', request.url))
    }
  }

  // Redirect to dashboard if accessing login while authenticated and approved
  if (user && request.nextUrl.pathname === '/login') {
    const { data: worker } = await supabase
      .from('workers')
      .select('approval_status')
      .eq('auth_user_id', user.id)
      .single()

    if (worker?.approval_status === 'approved') {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|public).*)',
  ],
}