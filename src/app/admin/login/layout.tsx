import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth'

export default function AdminLoginLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
