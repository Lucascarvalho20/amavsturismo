import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const isAdminLogin = pathname === '/admin/login'
  const isAdminRoute = pathname.startsWith('/admin')

  // Inject pathname into request headers so server components can read it
  const requestHeaders = new Headers(request.headers)
  requestHeaders.set('x-pathname', pathname)

  if (!isAdminRoute) {
    const res = NextResponse.next({ request: { headers: requestHeaders } })
    res.headers.set('X-Frame-Options', 'DENY')
    res.headers.set('X-Content-Type-Options', 'nosniff')
    return res
  }

  const rawUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseUrl = rawUrl?.replace(/\/rest\/v1\/?$/, '').replace(/\/+$/, '')
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  // If env vars missing, allow login through, block everything else
  if (!supabaseUrl || !supabaseKey) {
    if (isAdminLogin) {
      return NextResponse.next({ request: { headers: requestHeaders } })
    }
    return NextResponse.redirect(new URL('/admin/login', request.url))
  }

  let supabaseResponse = NextResponse.next({ request: { headers: requestHeaders } })

  try {
    const supabase = createServerClient(supabaseUrl, supabaseKey, {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet: Array<{ name: string; value: string; options?: Record<string, unknown> }>) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({ request: { headers: requestHeaders } })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options as Parameters<typeof supabaseResponse.cookies.set>[2])
          )
        },
      },
    })

    const { data: { user }, error } = await supabase.auth.getUser()

    if ((error || !user) && !isAdminLogin) {
      return NextResponse.redirect(new URL('/admin/login', request.url))
    }

    if (user && isAdminLogin) {
      return NextResponse.redirect(new URL('/admin/dashboard', request.url))
    }
  } catch {
    if (!isAdminLogin) {
      return NextResponse.redirect(new URL('/admin/login', request.url))
    }
  }

  supabaseResponse.headers.set('X-Frame-Options', 'DENY')
  supabaseResponse.headers.set('X-Content-Type-Options', 'nosniff')
  supabaseResponse.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')

  return supabaseResponse
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon|public|images).*)'],
}
