import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import ProductDetailClient from './ProductDetailClient'

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params

  const product = await prisma.product.findFirst({
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

  if (!product) {
    notFound()
  }

  // Related products
  const relatedProducts = await prisma.product.findMany({
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

  return <ProductDetailClient product={product} relatedProducts={relatedProducts} />
}
