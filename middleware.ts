import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { Database } from '@/types/database.types'

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  try {
    const supabase = createServerClient<Database>(
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

    // IMPORTANT: Avoid using supabase.auth.getSession() in middleware
    // Instead, check if we have a user by calling getUser()
    const { data: { user }, error } = await supabase.auth.getUser()
    
    // Handle auth errors gracefully
    if (error) {
      // Clear potentially corrupted auth cookies
      const response = NextResponse.redirect(new URL('/login', request.url))
      response.cookies.delete('sb-access-token')
      response.cookies.delete('sb-refresh-token')
      return response
    }

    // If user is authenticated, check for active worker record
    if (user) {
      const { data: worker, error: workerError } = await supabase
        .from('workers')
        .select('id, is_active')
        .eq('auth_user_id', user.id)
        .single()

      // If no worker record or inactive, treat as unauthenticated
      if (workerError || !worker || !worker.is_active) {
        // Don't redirect from login page to avoid loops
        if (request.nextUrl.pathname !== '/login') {
          const response = NextResponse.redirect(new URL('/login', request.url))
          return response
        }
      }
    }

  // Protected routes that require authentication
  const protectedPaths = [
    '/dashboard',
    '/product-configurator',
    '/production',
    '/quality',
    '/worker',
    '/management',
    '/reports',
    '/analytics',
    '/settings',
    '/admin'
  ]

  const isProtectedPath = protectedPaths.some(path => 
    request.nextUrl.pathname.startsWith(path)
  )

  // If accessing a protected path without authentication, redirect to login
  if (isProtectedPath && !user) {
    const redirectUrl = request.nextUrl.clone()
    redirectUrl.pathname = '/login'
    redirectUrl.searchParams.set('redirectTo', request.nextUrl.pathname)
    return NextResponse.redirect(redirectUrl)
  }

  // If authenticated with active worker and trying to access login page, redirect to dashboard
  // Note: We only redirect if they have a valid worker record to avoid loops
  if (user && request.nextUrl.pathname === '/login') {
    const { data: worker } = await supabase
      .from('workers')
      .select('id, is_active')
      .eq('auth_user_id', user.id)
      .single()
    
    if (worker && worker.is_active) {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }
  }

  return supabaseResponse
  } catch (error) {
    // Handle unexpected errors
    const response = NextResponse.redirect(new URL('/login', request.url))
    response.cookies.delete('sb-access-token')
    response.cookies.delete('sb-refresh-token')
    return response
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public (public files)
     * - api routes that don't require auth
     */
    '/((?!_next/static|_next/image|favicon.ico|public|api/shopify|api/health).*)',
  ],
}