import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const type = searchParams.get('type') || 'HERO'
    const banners = await prisma.banner.findMany({
      where: {
        type: type as any,
        isActive: true,
        OR: [{ startDate: null }, { startDate: { lte: new Date() } }],
        AND: [{ OR: [{ endDate: null }, { endDate: { gte: new Date() } }] }],
      },
      orderBy: { sortOrder: 'asc' },
    })
    return NextResponse.json({ success: true, data: banners })
  } catch (err) {
    const { fallbackBanners } = await import('@/lib/fallback-data')
    return NextResponse.json({ success: true, data: fallbackBanners })
  }
}
