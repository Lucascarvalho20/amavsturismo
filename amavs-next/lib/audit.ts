import type { AuditAction, AuditLog } from './types'

const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL

interface LogAuditParams {
  userId?: string | null
  userEmail?: string | null
  action: AuditAction
  resource?: string | null
  resourceId?: string | null
  details?: Record<string, unknown> | null
  ipAddress?: string | null
  userAgent?: string | null
}

export async function logAudit(params: LogAuditParams): Promise<void> {
  if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
    console.warn('[audit] Missing Supabase credentials — skipping audit log')
    return
  }

  try {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/audit_log`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        apikey: SERVICE_ROLE_KEY,
        Authorization: `Bearer ${SERVICE_ROLE_KEY}`,
        Prefer: 'return=minimal',
      },
      body: JSON.stringify({
        user_id: params.userId ?? null,
        user_email: params.userEmail ?? null,
        action: params.action,
        resource: params.resource ?? null,
        resource_id: params.resourceId ?? null,
        details: params.details ?? null,
        ip_address: params.ipAddress ?? null,
        user_agent: params.userAgent ?? null,
      }),
    })

    if (!response.ok) {
      const text = await response.text()
      console.error('[audit] Failed to write audit log:', text)
    }
  } catch (err) {
    console.error('[audit] Error writing audit log:', err)
  }
}

export async function logLoginAttempt(params: {
  email: string
  ipAddress: string | null
  success: boolean
}): Promise<void> {
  if (!SUPABASE_URL || !SERVICE_ROLE_KEY) return

  try {
    await fetch(`${SUPABASE_URL}/rest/v1/login_attempts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        apikey: SERVICE_ROLE_KEY,
        Authorization: `Bearer ${SERVICE_ROLE_KEY}`,
        Prefer: 'return=minimal',
      },
      body: JSON.stringify({
        email: params.email,
        ip_address: params.ipAddress,
        success: params.success,
      }),
    })
  } catch (err) {
    console.error('[audit] Error logging login attempt:', err)
  }
}

export async function isRateLimited(
  email: string,
  ipAddress: string | null
): Promise<{ blocked: boolean; attemptsLeft: number; resetAt: string | null }> {
  if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
    return { blocked: false, attemptsLeft: 5, resetAt: null }
  }

  const windowStart = new Date(Date.now() - 15 * 60 * 1000).toISOString()
  const headers = {
    apikey: SERVICE_ROLE_KEY,
    Authorization: `Bearer ${SERVICE_ROLE_KEY}`,
  }

  try {
    // Check by email
    const emailRes = await fetch(
      `${SUPABASE_URL}/rest/v1/login_attempts?email=eq.${encodeURIComponent(email)}&success=eq.false&created_at=gte.${encodeURIComponent(windowStart)}&select=id,created_at`,
      { headers }
    )
    const emailAttempts: Array<{ id: string; created_at: string }> = await emailRes.json()

    if (emailAttempts.length >= 5) {
      const oldest = emailAttempts.sort(
        (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      )[0]
      const resetAt = new Date(new Date(oldest.created_at).getTime() + 15 * 60 * 1000).toISOString()
      return { blocked: true, attemptsLeft: 0, resetAt }
    }

    // Check by IP
    if (ipAddress) {
      const ipRes = await fetch(
        `${SUPABASE_URL}/rest/v1/login_attempts?ip_address=eq.${encodeURIComponent(ipAddress)}&success=eq.false&created_at=gte.${encodeURIComponent(windowStart)}&select=id,created_at`,
        { headers }
      )
      const ipAttempts: Array<{ id: string; created_at: string }> = await ipRes.json()

      if (ipAttempts.length >= 10) {
        return { blocked: true, attemptsLeft: 0, resetAt: null }
      }
    }

    return { blocked: false, attemptsLeft: 5 - emailAttempts.length, resetAt: null }
  } catch (err) {
    console.error('[audit] Error checking rate limit:', err)
    return { blocked: false, attemptsLeft: 5, resetAt: null }
  }
}

export async function getAuditLog(limit = 50): Promise<AuditLog[]> {
  if (!SUPABASE_URL || !SERVICE_ROLE_KEY) return []

  try {
    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/audit_log?order=created_at.desc&limit=${limit}`,
      {
        headers: {
          apikey: SERVICE_ROLE_KEY,
          Authorization: `Bearer ${SERVICE_ROLE_KEY}`,
        },
      }
    )
    const data = await res.json()
    return Array.isArray(data) ? data : []
  } catch {
    return []
  }
}
