import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase-server'
import ProfileClient from './ProfileClient'

export const metadata = { title: 'Perfil — Admin' }

export default async function PerfilPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/admin/login')

  return (
    <ProfileClient
      userEmail={user.email ?? ''}
      userId={user.id}
      createdAt={user.created_at}
    />
  )
}
