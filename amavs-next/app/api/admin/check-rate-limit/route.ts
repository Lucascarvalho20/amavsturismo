import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, checkOnly } = body

    if (!email || typeof email !== 'string') {
      return NextResponse.json({ blocked: false })
    }

    const ip =
      request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
      request.headers.get('x-real-ip') ??
      'unknown'

    if (checkOnly) {
      return NextResponse.json({ ip })
    }

    // Use service role to bypass RLS for rate limit checks
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL

    if (!serviceRoleKey || !supabaseUrl) {
      // If not configured, allow login (fail open)
      return NextResponse.json({ blocked: false })
    }

    const supabase = createServerClient(supabaseUrl, serviceRoleKey, {
      cookies: { getAll: () => [], setAll: () => {} },
    })

    const windowStart = new Date(Date.now() - 15 * 60 * 1000).toISOString()

    const { data: attempts } = await supabase
      .from('login_attempts')
      .select('created_at')
      .eq('email', email.toLowerCase().trim())
      .eq('success', false)
      .gte('created_at', windowStart)
      .order('created_at', { ascending: false })
      .limit(10)

    const failCount = attempts?.length ?? 0

    if (failCount >= 5) {
      const lastAttempt = new Date(attempts![0].created_at).getTime()
      const resetAt = new Date(lastAttempt + 15 * 60 * 1000).toISOString()
      return NextResponse.json({
        blocked: true,
        resetAt,
        failCount,
      })
    }

    return NextResponse.json({ blocked: false, failCount })
  } catch {
    return NextResponse.json({ blocked: false })
  }
}
