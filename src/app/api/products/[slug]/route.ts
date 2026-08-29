import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
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
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }

    // Increment view count (async, non-blocking)
    prisma.product.update({ where: { id: product.id }, data: { viewCount: { increment: 1 } } }).catch(() => {})

    // Get related products
    const related = await prisma.product.findMany({
      where: {
        isPublished: true,
        categoryId: product.categoryId,
        id: { not: product.id },
      },
      take: 6,
      select: {
        id: true, name: true, slug: true, thumbnail: true,
        regularPrice: true, salePrice: true, stock: true,
        avgRating: true, reviewCount: true, isFreeDelivery: true,
      },
    })

    return NextResponse.json({ success: true, data: product, related })
  } catch (err) {
    console.error('Product detail error:', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
