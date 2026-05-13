import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase-server'
import Sidebar from '@/components/admin/Sidebar'
import SessionGuard from '@/components/admin/SessionGuard'

export const metadata = { title: "Admin — Amav's Turismo" }

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const headersList = headers()
  const pathname = headersList.get('x-pathname') ?? ''

  // Login page: render without sidebar or auth check
  if (pathname === '/admin/login') {
    return <>{children}</>
  }

  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/admin/login')
  }

  return (
    <div className="flex h-screen overflow-hidden bg-navy-200">
      <Sidebar userEmail={user.email ?? ''} />
      <main className="flex-1 overflow-y-auto scrollbar-thin">
        <div className="p-6 lg:p-8 max-w-screen-2xl mx-auto">
          {children}
        </div>
      </main>
      <SessionGuard />
    </div>
  )
}
