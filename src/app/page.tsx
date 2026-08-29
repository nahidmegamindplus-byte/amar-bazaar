import { prisma } from '@/lib/prisma'
import { getBrandingSettings } from '@/lib/settings'
import HomepageClient from './(store)/HomepageClient'
import StoreLayoutClient from './(store)/StoreLayoutClient'

export default async function RootHomePage() {
  const [
    branding,
    categories,
    sections,
    banners,
    flashSaleProducts,
    featuredProducts,
    newProducts,
    bestSellingProducts,
  ] = await Promise.all([
    getBrandingSettings(),
    prisma.category.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: 'asc' },
      include: {
        subcategories: { where: { isActive: true }, orderBy: { sortOrder: 'asc' } },
        _count: { select: { products: { where: { isPublished: true } } } },
      },
      take: 15,
    }),
    prisma.homepageSection.findMany({ where: { isActive: true }, orderBy: { sortOrder: 'asc' } }),
    prisma.banner.findMany({
      where: { type: 'HERO', isActive: true, OR: [{ startDate: null }, { startDate: { lte: new Date() } }] },
      orderBy: { sortOrder: 'asc' },
      take: 6,
    }),
    prisma.product.findMany({
      where: { isPublished: true, isFlashSale: true },
      take: 8,
      orderBy: { createdAt: 'desc' },
      include: {
        category: { select: { name: true, slug: true } },
        brand: { select: { name: true } },
      },
    }),
    prisma.product.findMany({
      where: { isPublished: true, isFeatured: true },
      take: 8,
      orderBy: { soldCount: 'desc' },
      include: {
        category: { select: { name: true, slug: true } },
        brand: { select: { name: true } },
      },
    }),
    prisma.product.findMany({
      where: { isPublished: true, isNewArrival: true },
      take: 8,
      orderBy: { createdAt: 'desc' },
      include: {
        category: { select: { name: true, slug: true } },
        brand: { select: { name: true } },
      },
    }),
    prisma.product.findMany({
      where: { isPublished: true, isBestSelling: true },
      take: 8,
      orderBy: { soldCount: 'desc' },
      include: {
        category: { select: { name: true, slug: true } },
        brand: { select: { name: true } },
      },
    }),
  ])

  return (
    <StoreLayoutClient branding={branding} categories={categories}>
      <HomepageClient
        sections={sections}
        categories={categories}
        banners={banners}
        flashSaleProducts={flashSaleProducts}
        featuredProducts={featuredProducts}
        newProducts={newProducts}
        bestSellingProducts={bestSellingProducts}
        settings={branding}
      />
    </StoreLayoutClient>
  )
}
