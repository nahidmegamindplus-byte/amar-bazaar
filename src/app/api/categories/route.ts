import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  try {
    const categories = await prisma.category.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: 'asc' },
      include: {
        subcategories: {
          where: { isActive: true },
          orderBy: { sortOrder: 'asc' },
        },
        _count: { select: { products: { where: { isPublished: true } } } },
      },
    })
    return NextResponse.json({ success: true, data: categories })
  } catch (err) {
    const { fallbackCategories } = await import('@/lib/fallback-data')
    return NextResponse.json({ success: true, data: fallbackCategories })
  }
}
