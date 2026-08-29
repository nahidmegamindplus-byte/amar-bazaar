import { prisma } from '@/lib/prisma'
import { getBrandingSettings } from '@/lib/settings'
import {
  fallbackCategories,
  fallbackProducts,
  fallbackBanners,
  fallbackSections,
} from '@/lib/fallback-data'
import HomepageClient from './(store)/HomepageClient'
import StoreLayoutClient from './(store)/StoreLayoutClient'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function RootHomePage() {
  const branding = await getBrandingSettings()
  let categories: any[] = fallbackCategories
  let sections: any[] = fallbackSections
  let banners: any[] = fallbackBanners
  let flashSaleProducts: any[] = fallbackProducts.filter(p => p.isFlashSale)
  let featuredProducts: any[] = fallbackProducts.filter(p => p.isFeatured)
  let newProducts: any[] = fallbackProducts.filter(p => p.isNewArrival)
  let bestSellingProducts: any[] = fallbackProducts.filter(p => p.isBestSelling)

  try {
    const [
      dbCategories,
      dbSections,
      dbBanners,
      dbFlashSaleProducts,
      dbFeaturedProducts,
      dbNewProducts,
      dbBestSellingProducts,
    ] = await Promise.all([
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

    if (dbCategories?.length) categories = dbCategories
    if (dbSections?.length) sections = dbSections
    if (dbBanners?.length) banners = dbBanners
    if (dbFlashSaleProducts?.length) flashSaleProducts = dbFlashSaleProducts
    if (dbFeaturedProducts?.length) featuredProducts = dbFeaturedProducts
    if (dbNewProducts?.length) newProducts = dbNewProducts
    if (dbBestSellingProducts?.length) bestSellingProducts = dbBestSellingProducts
  } catch {
    // Graceful fallback
  }

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
