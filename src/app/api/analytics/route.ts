import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/auth'
import { startOfDay, endOfDay, startOfMonth, endOfMonth, subDays, format } from 'date-fns'

export async function GET(req: NextRequest) {
  const { error } = await requireAdmin(req)
  if (error) return error

  try {
    const today = new Date()
    const todayStart = startOfDay(today)
    const todayEnd = endOfDay(today)
    const monthStart = startOfMonth(today)
    const last7Start = subDays(today, 6)
    const last30Start = subDays(today, 29)

    const [
      todayOrders,
      todayRevenueAgg,
      monthRevenueAgg,
      totalOrders,
      totalRevenueAgg,
      statusCounts,
      paymentMethodCounts,
      totalCustomers,
      newCustomersToday,
      totalProducts,
      lowStockProducts,
      outOfStockProducts,
      recentOrders,
      topProducts,
      allCompletedOrdersLast30,
      incompleteOrdersCount,
      recoveredIncompleteCount,
    ] = await Promise.all([
      // 1. Today's orders count
      prisma.order.count({ where: { createdAt: { gte: todayStart, lte: todayEnd } } }),
      // 2. Today's revenue
      prisma.order.aggregate({
        where: { createdAt: { gte: todayStart, lte: todayEnd }, status: { not: 'CANCELLED' } },
        _sum: { total: true },
      }),
      // 3. This month revenue
      prisma.order.aggregate({
        where: { createdAt: { gte: monthStart }, status: { not: 'CANCELLED' } },
        _sum: { total: true },
      }),
      // 4. Total orders
      prisma.order.count(),
      // 5. Total revenue
      prisma.order.aggregate({ where: { status: { not: 'CANCELLED' } }, _sum: { total: true } }),
      // 6. Group by status
      prisma.order.groupBy({
        by: ['status'],
        _count: { id: true },
      }),
      // 7. Group by payment method
      prisma.order.groupBy({
        by: ['paymentMethod'],
        _count: { id: true },
      }),
      // 8. Customers
      prisma.user.count({ where: { role: 'CUSTOMER' } }),
      prisma.user.count({ where: { role: 'CUSTOMER', createdAt: { gte: todayStart } } }),
      // 9. Products
      prisma.product.count({ where: { isPublished: true } }),
      prisma.product.count({ where: { isPublished: true, stock: { gt: 0, lte: 5 } } }),
      prisma.product.count({ where: { isPublished: true, stock: 0 } }),
      // 10. Recent orders
      prisma.order.findMany({
        take: 12,
        orderBy: { createdAt: 'desc' },
        include: {
          items: { take: 3 },
          payment: true,
        },
      }),
      // 11. Top selling products
      prisma.product.findMany({
        where: { isPublished: true },
        orderBy: { soldCount: 'desc' },
        take: 8,
        select: {
          id: true,
          name: true,
          slug: true,
          thumbnail: true,
          soldCount: true,
          regularPrice: true,
          salePrice: true,
          stock: true,
          category: { select: { name: true } },
        },
      }),
      // 12. All non-cancelled orders in last 30 days for time-series charts
      prisma.order.findMany({
        where: {
          createdAt: { gte: last30Start },
          status: { not: 'CANCELLED' },
        },
        select: {
          total: true,
          createdAt: true,
        },
      }),
      // 13. Incomplete orders count
      prisma.incompleteOrder.count(),
      // 14. Recovered orders count
      prisma.incompleteOrder.count({ where: { status: 'RECOVERED' } }),
    ])

    const totalRevenue = totalRevenueAgg._sum.total || 0
    const todayRevenue = todayRevenueAgg._sum.total || 0
    const monthRevenue = monthRevenueAgg._sum.total || 0
    const aov = totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0

    // Build Status Breakdown Map
    const statusMap: Record<string, number> = {
      PENDING: 0,
      CONFIRMED: 0,
      PROCESSING: 0,
      PACKED: 0,
      SHIPPED: 0,
      OUT_FOR_DELIVERY: 0,
      DELIVERED: 0,
      CANCELLED: 0,
    }
    statusCounts.forEach((s) => {
      statusMap[s.status] = s._count.id
    })

    // Build Payment Method Breakdown
    const paymentMap: Record<string, number> = {
      COD: 0,
      BKASH: 0,
      NAGAD: 0,
      ROCKET: 0,
      ONLINE: 0,
    }
    paymentMethodCounts.forEach((p) => {
      paymentMap[p.paymentMethod] = p._count.id
    })

    // Process daily revenue charts for 7 days & 30 days
    const dailyData7: Record<string, { date: string; revenue: number; orders: number }> = {}
    for (let i = 6; i >= 0; i--) {
      const d = subDays(today, i)
      const key = format(d, 'yyyy-MM-dd')
      const label = format(d, 'EEE, d MMM')
      dailyData7[key] = { date: label, revenue: 0, orders: 0 }
    }

    const dailyData30: Record<string, { date: string; revenue: number; orders: number }> = {}
    for (let i = 29; i >= 0; i--) {
      const d = subDays(today, i)
      const key = format(d, 'yyyy-MM-dd')
      const label = format(d, 'd MMM')
      dailyData30[key] = { date: label, revenue: 0, orders: 0 }
    }

    allCompletedOrdersLast30.forEach((ord) => {
      const key = format(new Date(ord.createdAt), 'yyyy-MM-dd')
      if (dailyData30[key]) {
        dailyData30[key].revenue += ord.total
        dailyData30[key].orders += 1
      }
      if (dailyData7[key]) {
        dailyData7[key].revenue += ord.total
        dailyData7[key].orders += 1
      }
    })

    const chart7Days = Object.values(dailyData7)
    const chart30Days = Object.values(dailyData30)

    const deliveryRate = totalOrders > 0
      ? Math.round((statusMap.DELIVERED / totalOrders) * 100)
      : 100

    const cartRecoveryRate = incompleteOrdersCount > 0
      ? Math.round((recoveredIncompleteCount / incompleteOrdersCount) * 100)
      : 0

    return NextResponse.json({
      success: true,
      data: {
        cards: {
          todaySales: todayRevenue,
          todayOrders,
          monthSales: monthRevenue,
          totalSales: totalRevenue,
          totalOrders,
          aov,
          pendingOrders: statusMap.PENDING,
          confirmedOrders: statusMap.CONFIRMED,
          processingOrders: statusMap.PROCESSING + statusMap.PACKED + statusMap.SHIPPED + statusMap.OUT_FOR_DELIVERY,
          deliveredOrders: statusMap.DELIVERED,
          cancelledOrders: statusMap.CANCELLED,
          deliveryRate,
          totalCustomers,
          newCustomersToday,
          totalProducts,
          lowStockProducts,
          outOfStockProducts,
          incompleteOrders: incompleteOrdersCount,
          recoveredIncomplete: recoveredIncompleteCount,
          cartRecoveryRate,
        },
        statusDistribution: [
          { name: 'Pending', count: statusMap.PENDING, color: '#f97316' },
          { name: 'Confirmed', count: statusMap.CONFIRMED, color: '#3b82f6' },
          { name: 'Processing', count: statusMap.PROCESSING + statusMap.PACKED, color: '#8b5cf6' },
          { name: 'Shipped / Transit', count: statusMap.SHIPPED + statusMap.OUT_FOR_DELIVERY, color: '#06b6d4' },
          { name: 'Delivered', count: statusMap.DELIVERED, color: '#16a34a' },
          { name: 'Cancelled', count: statusMap.CANCELLED, color: '#ef4444' },
        ],
        paymentDistribution: [
          { name: 'Cash on Delivery', count: paymentMap.COD, color: '#16a34a' },
          { name: 'bKash (বিকাশ)', count: paymentMap.BKASH, color: '#e11d48' },
          { name: 'Nagad (নগদ)', count: paymentMap.NAGAD, color: '#ea580c' },
          { name: 'Rocket (রকেট)', count: paymentMap.ROCKET, color: '#9333ea' },
        ],
        charts: {
          last7Days: chart7Days,
          last30Days: chart30Days,
        },
        topProducts,
        recentOrders,
      },
    })
  } catch (err) {
    console.error('Analytics error:', err)
    return NextResponse.json({ error: 'Failed to fetch analytics' }, { status: 500 })
  }
}
