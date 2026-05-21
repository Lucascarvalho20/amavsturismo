import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { isSameOrigin } from '@/lib/csrf'

export async function POST(request: NextRequest) {
  if (!isSameOrigin(request)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  try {
    const { email, success } = await request.json()

    if (!email) return NextResponse.json({ ok: true })

    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL

    if (!serviceRoleKey || !supabaseUrl) {
      return NextResponse.json({ ok: true })
    }

    const ip =
      request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
      request.headers.get('x-real-ip') ??
      'unknown'

    const userAgent = request.headers.get('user-agent')?.slice(0, 300) ?? ''

    const supabase = createServerClient(supabaseUrl, serviceRoleKey, {
      cookies: { getAll: () => [], setAll: () => {} },
    })

    // Log attempt
    await supabase.from('login_attempts').insert({
      email: email.toLowerCase().trim(),
      ip_address: ip,
      success: Boolean(success),
    })

    // Also log to audit table if successful
    if (success) {
      const { data: users } = await supabase.auth.admin.listUsers()
      const user = users?.users.find((u) => u.email?.toLowerCase() === email.toLowerCase())

      await supabase.from('audit_log').insert({
        user_id: user?.id ?? null,
        user_email: email.toLowerCase(),
        action: 'login',
        resource: 'auth',
        ip_address: ip,
        user_agent: userAgent,
      })
    }

    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ ok: true })
  }
}
