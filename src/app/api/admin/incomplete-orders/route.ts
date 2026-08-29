import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/auth'

export async function GET(req: NextRequest) {
  const { error } = await requireAdmin(req)
  if (error) return error

  try {
    const { searchParams } = new URL(req.url)
    const status = searchParams.get('status')
    const search = searchParams.get('search')
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'))
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '30')))
    const skip = (page - 1) * limit

    const whereClause: any = {}

    if (status && status !== 'ALL') {
      whereClause.status = status
    }

    if (search) {
      whereClause.OR = [
        { customerName: { contains: search } },
        { phone: { contains: search } },
        { email: { contains: search } },
        { address: { contains: search } },
        { district: { contains: search } },
      ]
    }

    const [items, totalCount, statsData] = await Promise.all([
      prisma.incompleteOrder.findMany({
        where: whereClause,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.incompleteOrder.count({ where: whereClause }),
      prisma.incompleteOrder.groupBy({
        by: ['status'],
        _count: { id: true },
        _sum: { total: true },
      }),
    ])

    // Calculate aggregated metrics
    let notContactedCount = 0
    let contactedCount = 0
    let recoveredCount = 0
    let cancelledCount = 0
    let potentialLostRevenue = 0
    let recoveredRevenue = 0
    let totalAll = 0

    statsData.forEach((stat) => {
      totalAll += stat._count.id
      const sumTotal = stat._sum.total || 0
      if (stat.status === 'NOT_CONTACTED') {
        notContactedCount += stat._count.id
        potentialLostRevenue += sumTotal
      } else if (stat.status === 'CONTACTED') {
        contactedCount += stat._count.id
        potentialLostRevenue += sumTotal
      } else if (stat.status === 'RECOVERED') {
        recoveredCount += stat._count.id
        recoveredRevenue += sumTotal
      } else if (stat.status === 'CANCELLED') {
        cancelledCount += stat._count.id
      }
    })

    const recoveryRate = totalAll > 0 ? ((recoveredCount / totalAll) * 100).toFixed(1) : '0'

    // Parse items JSON for client convenience
    const formattedItems = items.map((order) => {
      let parsedItems = []
      try {
        parsedItems = order.items ? JSON.parse(order.items) : []
      } catch {
        parsedItems = []
      }
      return {
        ...order,
        parsedItems,
      }
    })

    return NextResponse.json({
      success: true,
      data: formattedItems,
      pagination: {
        total: totalCount,
        page,
        limit,
        totalPages: Math.ceil(totalCount / limit),
      },
      stats: {
        totalAll,
        notContactedCount,
        contactedCount,
        recoveredCount,
        cancelledCount,
        potentialLostRevenue,
        recoveredRevenue,
        recoveryRate: Number(recoveryRate),
      },
    })
  } catch (err: any) {
    console.error('Error fetching admin incomplete orders:', err)
    return NextResponse.json({ success: false, error: 'Failed to fetch incomplete orders' }, { status: 500 })
  }
}
