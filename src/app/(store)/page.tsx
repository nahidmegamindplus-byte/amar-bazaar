import { prisma } from '@/lib/prisma'
import { getBrandingSettings } from '@/lib/settings'
import HomepageClient from './HomepageClient'

export default async function HomePage() {
  // Fetch everything from DB server-side for SEO
  const [sections, categories, banners, flashSaleProducts, featuredProducts, newProducts, bestSellingProducts, settings] = await Promise.all([
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
    getBrandingSettings(),
  ])

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
