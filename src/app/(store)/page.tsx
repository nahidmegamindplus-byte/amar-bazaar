import { prisma } from '@/lib/prisma'
import { getBrandingSettings } from '@/lib/settings'
import {
  fallbackCategories,
  fallbackProducts,
  fallbackBanners,
  fallbackSections,
} from '@/lib/fallback-data'
import HomepageClient from './HomepageClient'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function HomePage() {
  const settings = await getBrandingSettings()
  let sections: any[] = fallbackSections
  let categories: any[] = fallbackCategories
  let banners: any[] = fallbackBanners
  let flashSaleProducts: any[] = fallbackProducts.filter(p => p.isFlashSale)
  let featuredProducts: any[] = fallbackProducts.filter(p => p.isFeatured)
  let newProducts: any[] = fallbackProducts.filter(p => p.isNewArrival)
  let bestSellingProducts: any[] = fallbackProducts.filter(p => p.isBestSelling)

  try {
    const [
      dbSections,
      dbCategories,
      dbBanners,
      dbFlashSaleProducts,
      dbFeaturedProducts,
      dbNewProducts,
      dbBestSellingProducts,
    ] = await Promise.all([
      prisma.homepageSection.findMany({ where: { isActive: true }, orderBy: { sortOrder: 'asc' } }),
      prisma.category.findMany({ where: { isActive: true }, orderBy: { sortOrder: 'asc' }, include: { _count: { select: { products: { where: { isPublished: true } } } } }, take: 12 }),
      prisma.banner.findMany({
        where: { type: 'HERO', isActive: true, OR: [{ startDate: null }, { startDate: { lte: new Date() } }] },
        orderBy: { sortOrder: 'asc' }, take: 6,
      }),
      prisma.product.findMany({ where: { isPublished: true, isFlashSale: true }, take: 8, orderBy: { createdAt: 'desc' }, select: { id: true, name: true, slug: true, thumbnail: true, regularPrice: true, salePrice: true, stock: true, avgRating: true, reviewCount: true, isFreeDelivery: true, isOrganic: true, soldCount: true } }),
      prisma.product.findMany({ where: { isPublished: true, isFeatured: true }, take: 8, orderBy: { soldCount: 'desc' }, select: { id: true, name: true, slug: true, thumbnail: true, regularPrice: true, salePrice: true, stock: true, avgRating: true, reviewCount: true, isFreeDelivery: true, isOrganic: true, soldCount: true } }),
      prisma.product.findMany({ where: { isPublished: true, isNewArrival: true }, take: 8, orderBy: { createdAt: 'desc' }, select: { id: true, name: true, slug: true, thumbnail: true, regularPrice: true, salePrice: true, stock: true, avgRating: true, reviewCount: true, isFreeDelivery: true, isOrganic: true, soldCount: true } }),
      prisma.product.findMany({ where: { isPublished: true, isBestSelling: true }, take: 8, orderBy: { soldCount: 'desc' }, select: { id: true, name: true, slug: true, thumbnail: true, regularPrice: true, salePrice: true, stock: true, avgRating: true, reviewCount: true, isFreeDelivery: true, isOrganic: true, soldCount: true } }),
    ])

    if (dbSections?.length) sections = dbSections
    if (dbCategories?.length) categories = dbCategories
    if (dbBanners?.length) banners = dbBanners
    if (dbFlashSaleProducts?.length) flashSaleProducts = dbFlashSaleProducts
    if (dbFeaturedProducts?.length) featuredProducts = dbFeaturedProducts
    if (dbNewProducts?.length) newProducts = dbNewProducts
    if (dbBestSellingProducts?.length) bestSellingProducts = dbBestSellingProducts
  } catch {
    // Fallback safely
  }

  return (
    <HomepageClient
      sections={sections}
      categories={categories}
      banners={banners}
      flashSaleProducts={flashSaleProducts}
      featuredProducts={featuredProducts}
      newProducts={newProducts}
      bestSellingProducts={bestSellingProducts}
      settings={settings}
    />
  )
}
