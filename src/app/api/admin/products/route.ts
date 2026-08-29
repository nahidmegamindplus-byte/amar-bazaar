import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/auth'
import { logActivity } from '@/lib/notifications'
import { getPaginationParams, paginationMeta } from '@/lib/api-helpers'
import { z } from 'zod'

const productSchema = z.object({
  name: z.string().min(1),
  slug: z.string().min(1),
  sku: z.string().optional(),
  barcode: z.string().optional(),
  categoryId: z.string().optional(),
  subCategoryId: z.string().optional(),
  brandId: z.string().optional(),
  shortDesc: z.string().optional(),
  description: z.string().optional(),
  thumbnail: z.string().optional(),
  videoUrl: z.string().optional(),
  regularPrice: z.number().min(0),
  salePrice: z.number().optional().nullable(),
  costPrice: z.number().optional().nullable(),
  stock: z.number().int().min(0).default(0),
  lowStockThreshold: z.number().int().default(5),
  weight: z.number().optional().nullable(),
  unit: z.string().optional(),
  tags: z.array(z.string()).optional(),
  isFeatured: z.boolean().optional(),
  isBestSelling: z.boolean().optional(),
  isTrending: z.boolean().optional(),
  isNewArrival: z.boolean().optional(),
  isOffer: z.boolean().optional(),
  isPreOrder: z.boolean().optional(),
  isFreeDelivery: z.boolean().optional(),
  isOrganic: z.boolean().optional(),
  isFlashSale: z.boolean().optional(),
  isPublished: z.boolean().optional(),
  seoTitle: z.string().optional(),
  seoDesc: z.string().optional(),
  seoKeywords: z.string().optional(),
  images: z.array(z.object({ url: z.string(), alt: z.string().optional(), sortOrder: z.number().optional() })).optional(),
  variants: z.array(z.object({
    name: z.string(),
    sku: z.string().optional(),
    price: z.number().optional().nullable(),
    salePrice: z.number().optional().nullable(),
    stock: z.number().int().default(0),
    weight: z.number().optional().nullable(),
    image: z.string().optional(),
    sortOrder: z.number().optional(),
    isDefault: z.boolean().optional(),
  })).optional(),
  attributes: z.array(z.object({
    name: z.string(),
    value: z.string(),
    sortOrder: z.number().optional(),
  })).optional(),
})

export async function GET(req: NextRequest) {
  const { error } = await requireAdmin(req)
  if (error) return error

  try {
    const { searchParams } = new URL(req.url)
    const { page, limit, skip } = getPaginationParams(searchParams)
    const search = searchParams.get('search')
    const categoryId = searchParams.get('categoryId')
    const brandId = searchParams.get('brandId')
    const status = searchParams.get('status')

    const where: any = {}
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { sku: { contains: search } },
        { barcode: { contains: search } },
      ]
    }
    if (categoryId) where.categoryId = categoryId
    if (brandId) where.brandId = brandId
    if (status === 'published') where.isPublished = true
    if (status === 'draft') where.isPublished = false

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          category: { select: { name: true } },
          brand: { select: { name: true } },
        },
      }),
      prisma.product.count({ where }),
    ])

    return NextResponse.json({ success: true, data: products, pagination: paginationMeta(total, page, limit) })
  } catch (err) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  const { error, session } = await requireAdmin(req)
  if (error) return error

  try {
    const body = await req.json()
    const parsed = productSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid data', details: parsed.error.flatten() }, { status: 400 })
    }

    const { images, variants, attributes, tags, ...productData } = parsed.data

    // Check slug uniqueness
    const existing = await prisma.product.findFirst({ where: { slug: productData.slug } })
    if (existing) {
      return NextResponse.json({ error: 'Slug already exists. Use a unique slug.' }, { status: 409 })
    }

    const product = await prisma.product.create({
      data: {
        ...productData,
        tags: JSON.stringify(tags || []),
        images: images ? { create: images } : undefined,
        variants: variants ? { create: variants } : undefined,
        attributes: attributes ? { create: attributes } : undefined,
        inventory: { create: { quantity: productData.stock } },
      },
      include: { images: true, variants: true, attributes: true },
    })

    // Log activity
    await logActivity({ adminId: session!.userId, action: 'PRODUCT_CREATED', target: 'Product', targetId: product.id, details: `Created product: ${product.name}` })

    // Inventory transaction
    if (productData.stock > 0) {
      await prisma.inventoryTransaction.create({
        data: { productId: product.id, type: 'PURCHASE', quantity: productData.stock, note: 'Initial stock', createdBy: session!.userId },
      })
    }

    return NextResponse.json({ success: true, data: product }, { status: 201 })
  } catch (err: any) {
    console.error('Create product error:', err)
    if (err.code === 'P2002') return NextResponse.json({ error: 'SKU or slug already exists' }, { status: 409 })
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
