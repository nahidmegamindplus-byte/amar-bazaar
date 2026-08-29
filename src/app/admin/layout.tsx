import { getSession } from '@/lib/auth'
import AdminLayoutClient from './AdminLayoutClient'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession()

  let user = null
  if (session?.userId) {
    try {
      user = await prisma.user.findUnique({
        where: { id: session.userId },
        select: { name: true, email: true, role: true },
      })
    } catch {
      // DB fallback
    }
  }

  const isAuthenticated = Boolean(
    session && (!user || user.role !== 'CUSTOMER')
  )

  return (
    <AdminLayoutClient
      adminName={user?.name || 'Super Admin'}
      adminEmail={user?.email || 'admin@shuddho.com'}
      isAuthenticated={isAuthenticated}
    >
      {children}
    </AdminLayoutClient>
  )
}
