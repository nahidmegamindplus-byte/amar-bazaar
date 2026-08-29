import { prisma } from '@/lib/prisma'
import { fallbackProducts } from '@/lib/fallback-data'
import { notFound } from 'next/navigation'
import ProductDetailClient from './ProductDetailClient'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params

  let product: any = null
  let relatedProducts: any[] = []

  try {
    product = await prisma.product.findFirst({
      where: { slug, isPublished: true },
      include: {
        category: true,
        subCategory: true,
        brand: true,
        images: { orderBy: { sortOrder: 'asc' } },
        variants: { orderBy: { sortOrder: 'asc' } },
        attributes: { orderBy: { sortOrder: 'asc' } },
        reviews: {
          where: { isApproved: true },
          include: {
            user: { select: { name: true, avatar: true } },
            images: true,
          },
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
      },
    })

    if (product) {
      relatedProducts = await prisma.product.findMany({
        where: {
          categoryId: product.categoryId,
          id: { not: product.id },
          isPublished: true,
        },
        take: 4,
        include: {
          category: { select: { name: true, slug: true } },
          brand: { select: { name: true } },
        },
      })
    }
  } catch {
    // DB fallback
  }

  // Fallback to mock product if DB failed or product not found in DB
  if (!product) {
    product = fallbackProducts.find(p => p.slug === slug) || fallbackProducts[0]
    relatedProducts = fallbackProducts.filter(p => p.slug !== product.slug).slice(0, 4)
  }

  if (!product) {
    notFound()
  }

  return <ProductDetailClient product={product} relatedProducts={relatedProducts} />
}
