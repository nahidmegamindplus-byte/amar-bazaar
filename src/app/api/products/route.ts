import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getPaginationParams, paginationMeta } from '@/lib/api-helpers'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const { page, limit, skip } = getPaginationParams(searchParams)

    const category = searchParams.get('category')
    const subcategory = searchParams.get('subcategory')
    const brand = searchParams.get('brand')
    const minPrice = parseFloat(searchParams.get('minPrice') || '0')
    const maxPrice = parseFloat(searchParams.get('maxPrice') || '999999')
    const inStock = searchParams.get('inStock') === 'true'
    const isFeatured = searchParams.get('featured') === 'true'
    const isBestSelling = searchParams.get('bestSelling') === 'true'
    const isNewArrival = searchParams.get('newArrival') === 'true'
    const isOffer = searchParams.get('offer') === 'true'
    const isFlashSale = searchParams.get('flashSale') === 'true'
    const isOrganic = searchParams.get('organic') === 'true'
    const isTrending = searchParams.get('trending') === 'true'
    const sort = searchParams.get('sort') || 'newest'

    // Build where clause
    const where: any = { isPublished: true }

    if (category) {
      const cat = await prisma.category.findFirst({ where: { slug: category } })
      if (cat) where.categoryId = cat.id
    }
    if (subcategory) {
      const sub = await prisma.subCategory.findFirst({ where: { slug: subcategory } })
      if (sub) where.subCategoryId = sub.id
    }
    if (brand) {
      const b = await prisma.brand.findFirst({ where: { slug: brand } })
      if (b) where.brandId = b.id
    }
    if (minPrice > 0 || maxPrice < 999999) {
      where.OR = [
        { salePrice: { gte: minPrice, lte: maxPrice } },
        { regularPrice: { gte: minPrice, lte: maxPrice } },
      ]
    }
    if (inStock) where.stock = { gt: 0 }
    if (isFeatured) where.isFeatured = true
    if (isBestSelling) where.isBestSelling = true
    if (isNewArrival) where.isNewArrival = true
    if (isOffer) where.isOffer = true
    if (isFlashSale) where.isFlashSale = true
    if (isOrganic) where.isOrganic = true
    if (isTrending) where.isTrending = true

    // Sort
    let orderBy: any = { createdAt: 'desc' }
    if (sort === 'price_asc') orderBy = { regularPrice: 'asc' }
    else if (sort === 'price_desc') orderBy = { regularPrice: 'desc' }
    else if (sort === 'best_selling') orderBy = { soldCount: 'desc' }
    else if (sort === 'top_rated') orderBy = { avgRating: 'desc' }

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        select: {
          id: true,
          name: true,
          slug: true,
          sku: true,
          thumbnail: true,
          regularPrice: true,
          salePrice: true,
          stock: true,
          lowStockThreshold: true,
          unit: true,
          avgRating: true,
          reviewCount: true,
          soldCount: true,
          isFeatured: true,
          isBestSelling: true,
          isNewArrival: true,
          isOffer: true,
          isFlashSale: true,
          isOrganic: true,
          isFreeDelivery: true,
          isPreOrder: true,
          category: { select: { name: true, slug: true } },
          brand: { select: { name: true, slug: true } },
          variants: { select: { id: true, name: true, price: true, salePrice: true, stock: true }, orderBy: { sortOrder: 'asc' } },
        },
      }),
      prisma.product.count({ where }),
    ])

    return NextResponse.json({
      success: true,
      data: products,
      pagination: paginationMeta(total, page, limit),
    })
  } catch (err) {
    console.error('Products GET error, returning fallback:', err)
    const { fallbackProducts } = await import('@/lib/fallback-data')
    return NextResponse.json({
      success: true,
      data: fallbackProducts,
      pagination: { total: fallbackProducts.length, page: 1, limit: 20, totalPages: 1, hasNext: false, hasPrev: false },
    })
  }
}
