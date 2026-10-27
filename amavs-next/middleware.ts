import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

// Proteção das rotas /admin/*:
//  1. exige sessão válida (verificada no servidor do Supabase via getUser)
//  2. exige que o e-mail esteja em ADMIN_EMAILS (quando configurado)
//  3. exige 2FA (AAL2) para quem tem fator TOTP cadastrado
//  4. com REQUIRE_ADMIN_MFA=true, obriga todo admin a cadastrar 2FA
// A camada de dados tem a mesma regra via RLS (public.is_admin()) — o middleware
// só evita que alguém sem permissão sequer veja as telas.

const MFA_SETUP_PATH = '/admin/setup-mfa'

function allowlist(): string[] {
  return (process.env.ADMIN_EMAILS ?? '')
    .split(',')
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean)
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const isAdminLogin = pathname === '/admin/login'
  const isAdminRoot = pathname === '/admin'
  const isAdminRoute = pathname === '/admin' || pathname.startsWith('/admin/')

  // Inject pathname into request headers so server components can read it
  const requestHeaders = new Headers(request.headers)
  requestHeaders.set('x-pathname', pathname)

  if (!isAdminRoute) {
    return NextResponse.next({ request: { headers: requestHeaders } })
  }

  const loginUrl = (reason?: string) => {
    const url = new URL('/admin/login', request.url)
    if (reason) url.searchParams.set('motivo', reason)
    return url
  }

  const rawUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseUrl = rawUrl?.replace(/\/rest\/v1\/?$/, '').replace(/\/+$/, '')
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  // Sem configuração: só a tela de login fica acessível
  if (!supabaseUrl || !supabaseKey) {
    return isAdminLogin
      ? NextResponse.next({ request: { headers: requestHeaders } })
      : NextResponse.redirect(loginUrl())
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

    if (error || !user) {
      return isAdminLogin ? withAdminHeaders(supabaseResponse) : NextResponse.redirect(loginUrl())
    }

    // E-mail fora da lista de administradores → encerra a sessão e volta ao login
    const allowed = allowlist()
    if (allowed.length > 0 && !allowed.includes((user.email ?? '').toLowerCase())) {
      await supabase.auth.signOut()
      const res = NextResponse.redirect(loginUrl('nao_autorizado'))
      supabaseResponse.cookies.getAll().forEach((c) => res.cookies.set(c))
      return res
    }

    const { data: aal } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel()
    const hasFactor = aal?.nextLevel === 'aal2'
    const mfaPending = hasFactor && aal?.currentLevel !== 'aal2'

    // Senha correta mas 2FA ainda não validado: só a tela de login (etapa do código)
    if (mfaPending) {
      return isAdminLogin ? withAdminHeaders(supabaseResponse) : NextResponse.redirect(loginUrl('2fa'))
    }

    // 2FA obrigatório e ainda não cadastrado: só a tela de cadastro do 2FA
    if (process.env.REQUIRE_ADMIN_MFA === 'true' && !hasFactor && pathname !== MFA_SETUP_PATH) {
      return NextResponse.redirect(new URL(MFA_SETUP_PATH, request.url))
    }

    if (isAdminLogin || isAdminRoot) {
      return NextResponse.redirect(new URL('/admin/dashboard', request.url))
    }
  } catch {
    if (!isAdminLogin) {
      return NextResponse.redirect(loginUrl())
    }
  }

  return withAdminHeaders(supabaseResponse)
}

function withAdminHeaders(res: NextResponse) {
  res.headers.set('X-Robots-Tag', 'noindex, nofollow')
  res.headers.set('Cache-Control', 'no-store')
  return res
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon|images|api).*)'],
}
