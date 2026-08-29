import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/auth'
import { startOfDay, endOfDay, startOfMonth, subDays, subMonths, startOfToday } from 'date-fns'

export async function GET(req: NextRequest) {
  const { error, session } = await requireAdmin(req)
  if (error) return error

  try {
    const today = new Date()
    const todayStart = startOfDay(today)
    const todayEnd = endOfDay(today)
    const monthStart = startOfMonth(today)
    const last7Start = subDays(today, 7)
    const last30Start = subDays(today, 30)

    const [
      todayOrders,
      todayRevenue,
      totalOrders,
      totalRevenue,
      pendingOrders,
      processingOrders,
      deliveredOrders,
      cancelledOrders,
      totalCustomers,
      newCustomersToday,
      totalProducts,
      lowStockProducts,
      outOfStockProducts,
      recentOrders,
      topProducts,
      revenueLast30Days,
    ] = await Promise.all([
      // Today's orders count
      prisma.order.count({ where: { createdAt: { gte: todayStart, lte: todayEnd } } }),
      // Today's revenue
      prisma.order.aggregate({
        where: { createdAt: { gte: todayStart, lte: todayEnd }, status: { not: 'CANCELLED' } },
        _sum: { total: true },
      }),
      // Total orders
      prisma.order.count(),
      // Total revenue
      prisma.order.aggregate({ where: { status: { not: 'CANCELLED' } }, _sum: { total: true } }),
      // Status counts
      prisma.order.count({ where: { status: 'PENDING' } }),
      prisma.order.count({ where: { status: { in: ['CONFIRMED', 'PROCESSING', 'PACKED', 'SHIPPED', 'OUT_FOR_DELIVERY'] } } }),
      prisma.order.count({ where: { status: 'DELIVERED' } }),
      prisma.order.count({ where: { status: 'CANCELLED' } }),
      // Customers
      prisma.user.count({ where: { role: 'CUSTOMER' } }),
      prisma.user.count({ where: { role: 'CUSTOMER', createdAt: { gte: todayStart } } }),
      // Products
      prisma.product.count({ where: { isPublished: true } }),
      prisma.product.count({ where: { isPublished: true, stock: { gt: 0, lte: 5 } } }),
      prisma.product.count({ where: { isPublished: true, stock: 0 } }),
      // Recent orders
      prisma.order.findMany({
        take: 10,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true, orderNumber: true, shippingName: true, shippingPhone: true,
          total: true, status: true, paymentMethod: true, paymentStatus: true,
          createdAt: true, items: { take: 1, select: { productName: true, thumbnail: true } },
        },
      }),
      // Top selling products
      prisma.product.findMany({
        where: { isPublished: true },
        orderBy: { soldCount: 'desc' },
        take: 8,
        select: { id: true, name: true, slug: true, thumbnail: true, soldCount: true, regularPrice: true, salePrice: true, stock: true },
      }),
      // Revenue last 30 days (group by day)
      prisma.order.groupBy({
        by: ['createdAt'],
        where: {
          createdAt: { gte: last30Start },
          status: { not: 'CANCELLED' },
        },
        _sum: { total: true },
        _count: true,
      }),
    ])

    // Process daily revenue chart data
    const last30Data: Record<string, { revenue: number; orders: number }> = {}
    for (let i = 29; i >= 0; i--) {
      const d = subDays(today, i)
      const key = d.toISOString().slice(0, 10)
      last30Data[key] = { revenue: 0, orders: 0 }
    }
    for (const row of revenueLast30Days) {
      const key = new Date(row.createdAt).toISOString().slice(0, 10)
      if (last30Data[key]) {
        last30Data[key].revenue += row._sum.total || 0
        last30Data[key].orders += row._count
      }
    }

    const chartData = Object.entries(last30Data).map(([date, values]) => ({
      date,
      revenue: Math.round(values.revenue),
      orders: values.orders,
    }))

    // Order status distribution
    const statusCounts = [
      { status: 'Pending', count: pendingOrders },
      { status: 'Active', count: processingOrders },
      { status: 'Delivered', count: deliveredOrders },
      { status: 'Cancelled', count: cancelledOrders },
    ]

    return NextResponse.json({
      success: true,
      data: {
        cards: {
          todayOrders,
          todaySales: todayRevenue._sum.total || 0,
          totalOrders,
          totalSales: totalRevenue._sum.total || 0,
          pendingOrders,
          processingOrders,
          deliveredOrders,
          cancelledOrders,
          totalCustomers,
          newCustomersToday,
          totalProducts,
          lowStockProducts,
          outOfStockProducts,
        },
        recentOrders,
        topProducts,
        chartData,
        statusCounts,
      },
    })
  } catch (err) {
    console.error('Analytics error:', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
