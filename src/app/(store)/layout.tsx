import { getBrandingSettings } from '@/lib/settings'
import { prisma } from '@/lib/prisma'
import { fallbackCategories } from '@/lib/fallback-data'
import StoreLayoutClient from './StoreLayoutClient'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function StoreLayout({ children }: { children: React.ReactNode }) {
  const branding = await getBrandingSettings()
  let categories: any[] = fallbackCategories

  try {
    const dbCategories = await prisma.category.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: 'asc' },
      include: { subcategories: { where: { isActive: true }, orderBy: { sortOrder: 'asc' } } },
      take: 15,
    })
    if (dbCategories && dbCategories.length > 0) {
      categories = dbCategories
    }
  } catch {
    // Graceful fallback if database is unavailable
  }

  return (
    <StoreLayoutClient branding={branding} categories={categories}>
      {children}
    </StoreLayoutClient>
  )
}
