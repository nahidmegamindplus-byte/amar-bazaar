import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const q = searchParams.get('q')?.trim()

    if (!q || q.length < 2) {
      return NextResponse.json({ success: true, data: [] })
    }

    const products = await prisma.product.findMany({
      where: {
        isPublished: true,
        OR: [
          { name: { contains: q } },
          { sku: { contains: q } },
          { tags: { contains: q } },
          { brand: { name: { contains: q } } },
          { category: { name: { contains: q } } },
          { shortDesc: { contains: q } },
        ],
      },
      take: 8,
      select: {
        id: true, name: true, slug: true, thumbnail: true,
        regularPrice: true, salePrice: true, stock: true,
        brand: { select: { name: true } },
        category: { select: { name: true } },
      },
      orderBy: { soldCount: 'desc' },
    })

    return NextResponse.json({ success: true, data: products })
  } catch (err) {
    return NextResponse.json({ error: 'Search error' }, { status: 500 })
  }
}
