import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase-server'
import ProfileClient, { type LoginRecord } from './ProfileClient'

export const metadata = { title: 'Perfil — Admin' }

export default async function PerfilPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/admin/login')

  const email = (user.email ?? '').toLowerCase()
  const [factors, attempts] = await Promise.all([
    supabase.auth.mfa.listFactors(),
    // a policy login_attempts_admin_read libera a leitura só para admin
    supabase
      .from('login_attempts')
      .select('created_at, ip_address, success')
      .eq('email', email)
      .order('created_at', { ascending: false })
      .limit(10),
  ])

  const totp = factors.data?.totp ?? []

  return (
    <ProfileClient
      userEmail={user.email ?? ''}
      createdAt={user.created_at}
      lastSignInAt={user.last_sign_in_at ?? null}
      mfaSince={totp[0]?.created_at ?? null}
      recentLogins={(attempts.data ?? []) as LoginRecord[]}
    />
  )
}
