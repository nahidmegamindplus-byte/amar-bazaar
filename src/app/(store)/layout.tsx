import { getBrandingSettings } from '@/lib/settings'
import { prisma } from '@/lib/prisma'
import StoreLayoutClient from './StoreLayoutClient'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function StoreLayout({ children }: { children: React.ReactNode }) {
  const branding = await getBrandingSettings()
  const categories = await prisma.category.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: 'asc' },
    include: { subcategories: { where: { isActive: true }, orderBy: { sortOrder: 'asc' } } },
    take: 15,
  })

  return (
    <StoreLayoutClient branding={branding} categories={categories}>
      {children}
    </StoreLayoutClient>
  )
}
