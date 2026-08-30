import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/auth'
import {
  startOfDay, endOfDay, startOfMonth, endOfMonth, subDays, subMonths,
  format, eachDayOfInterval, parseISO, isSameDay
} from 'date-fns'

export async function GET(req: NextRequest) {
  const { error } = await requireAdmin(req)
  if (error) return error

  try {
    const { searchParams } = new URL(req.url)
    const range = searchParams.get('range') || '7days'
    const customStart = searchParams.get('startDate')
    const customEnd = searchParams.get('endDate')

    const now = new Date()
    let startDate: Date = subDays(now, 6)
    let endDate: Date = endOfDay(now)
    let rangeLabel = 'Last 7 Days'

    if (range === 'today') {
      startDate = startOfDay(now)
      endDate = endOfDay(now)
      rangeLabel = 'Today (আজকে)'
    } else if (range === 'yesterday') {
      const yest = subDays(now, 1)
      startDate = startOfDay(yest)
      endDate = endOfDay(yest)
      rangeLabel = 'Yesterday (গতকাল)'
    } else if (range === '7days') {
      startDate = startOfDay(subDays(now, 6))
      endDate = endOfDay(now)
      rangeLabel = 'Last 7 Days (গত ৭ দিন)'
    } else if (range === '14days') {
      startDate = startOfDay(subDays(now, 13))
      endDate = endOfDay(now)
      rangeLabel = 'Last 14 Days (গত ১৪ দিন)'
    } else if (range === '30days') {
      startDate = startOfDay(subDays(now, 29))
      endDate = endOfDay(now)
      rangeLabel = 'Last 30 Days (গত ৩০ দিন)'
    } else if (range === 'thisMonth') {
      startDate = startOfMonth(now)
      endDate = endOfDay(now)
      rangeLabel = 'This Month (চলতি মাস)'
    } else if (range === 'lastMonth') {
      const prevMonth = subMonths(now, 1)
      startDate = startOfMonth(prevMonth)
      endDate = endOfMonth(prevMonth)
      rangeLabel = 'Last Month (গত মাস)'
    } else if (range === 'custom' && customStart && customEnd) {
      startDate = startOfDay(parseISO(customStart))
      endDate = endOfDay(parseISO(customEnd))
      rangeLabel = `${format(startDate, 'dd MMM yyyy')} - ${format(endDate, 'dd MMM yyyy')}`
    } else if (range === 'all') {
      startDate = new Date(2020, 0, 1)
      endDate = endOfDay(now)
      rangeLabel = 'All Time'
    }

    const todayStart = startOfDay(now)
    const todayEnd = endOfDay(now)

    // Execute parallel DB queries
    const [
      rangeOrdersCount,
      rangeRevenueAgg,
      statusCounts,
      paymentMethodCounts,
      todayOrders,
      todayRevenueAgg,
      totalOrdersAllTime,
      totalRevenueAllTime,
      totalCustomers,
      newCustomersRange,
      totalProducts,
      lowStockProducts,
      outOfStockProducts,
      rangeOrdersList,
      topProducts,
      incompleteOrdersCount,
      recoveredIncompleteCount,
    ] = await Promise.all([
      // 1. Orders count in selected date range
      prisma.order.count({ where: { createdAt: { gte: startDate, lte: endDate } } }),
      // 2. Revenue in selected date range (excluding cancelled)
      prisma.order.aggregate({
        where: { createdAt: { gte: startDate, lte: endDate }, status: { not: 'CANCELLED' } },
        _sum: { total: true },
      }),
      // 3. Status breakdown in selected date range
      prisma.order.groupBy({
        by: ['status'],
        where: { createdAt: { gte: startDate, lte: endDate } },
        _count: { id: true },
      }),
      // 4. Payment breakdown in selected date range
      prisma.order.groupBy({
        by: ['paymentMethod'],
        where: { createdAt: { gte: startDate, lte: endDate } },
        _count: { id: true },
      }),
      // 5. Today's orders
      prisma.order.count({ where: { createdAt: { gte: todayStart, lte: todayEnd } } }),
      // 6. Today's revenue
      prisma.order.aggregate({
        where: { createdAt: { gte: todayStart, lte: todayEnd }, status: { not: 'CANCELLED' } },
        _sum: { total: true },
      }),
      // 7. All-time orders
      prisma.order.count(),
      // 8. All-time revenue
      prisma.order.aggregate({ where: { status: { not: 'CANCELLED' } }, _sum: { total: true } }),
      // 9. Total customers
      prisma.user.count({ where: { role: 'CUSTOMER' } }),
      // 10. Customers joined in date range
      prisma.user.count({ where: { role: 'CUSTOMER', createdAt: { gte: startDate, lte: endDate } } }),
      // 11. Products counts
      prisma.product.count({ where: { isPublished: true } }),
      prisma.product.count({ where: { isPublished: true, stock: { gt: 0, lte: 5 } } }),
      prisma.product.count({ where: { isPublished: true, stock: 0 } }),
      // 12. Non-cancelled orders in range for time-series charts
      prisma.order.findMany({
        where: { createdAt: { gte: startDate, lte: endDate }, status: { not: 'CANCELLED' } },
        select: { total: true, createdAt: true },
        orderBy: { createdAt: 'asc' },
      }),
      // 13. Top selling products
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
      // 14. Incomplete orders in range
      prisma.incompleteOrder.count({ where: { createdAt: { gte: startDate, lte: endDate } } }),
      // 15. Recovered incomplete orders
      prisma.incompleteOrder.count({ where: { createdAt: { gte: startDate, lte: endDate }, status: 'RECOVERED' } }),
    ])

    const rangeRevenue = rangeRevenueAgg._sum.total || 0
    const todayRevenue = todayRevenueAgg._sum.total || 0
    const totalRevenue = totalRevenueAllTime._sum.total || 0
    const aov = rangeOrdersCount > 0 ? Math.round(rangeRevenue / rangeOrdersCount) : 0

    // Build Status Distribution Map
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

    // Build Payment Map
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

    // Generate Dynamic Date Points for Chart
    let chartData: Array<{ date: string; fullDate: string; revenue: number; orders: number }> = []

    if (range === 'today' || range === 'yesterday') {
      // 24 Hour points
      const hoursMap: Record<number, { revenue: number; orders: number }> = {}
      for (let h = 0; h < 24; h++) {
        hoursMap[h] = { revenue: 0, orders: 0 }
      }
      rangeOrdersList.forEach((ord) => {
        const h = new Date(ord.createdAt).getHours()
        hoursMap[h].revenue += ord.total
        hoursMap[h].orders += 1
      })
      chartData = Object.entries(hoursMap).map(([h, val]) => ({
        date: `${h}:00`,
        fullDate: `${h}:00 - ${h}:59`,
        revenue: val.revenue,
        orders: val.orders,
      }))
    } else {
      // Daily intervals
      const days = eachDayOfInterval({ start: startDate, end: endDate })
      const dayMap: Record<string, { label: string; fullDate: string; revenue: number; orders: number }> = {}

      days.forEach((d) => {
        const key = format(d, 'yyyy-MM-dd')
        dayMap[key] = {
          label: format(d, days.length > 14 ? 'd MMM' : 'EEE, d MMM'),
          fullDate: format(d, 'yyyy-MM-dd'),
          revenue: 0,
          orders: 0,
        }
      })

      rangeOrdersList.forEach((ord) => {
        const key = format(new Date(ord.createdAt), 'yyyy-MM-dd')
        if (dayMap[key]) {
          dayMap[key].revenue += ord.total
          dayMap[key].orders += 1
        }
      })

      chartData = Object.values(dayMap).map((item) => ({
        date: item.label,
        fullDate: item.fullDate,
        revenue: item.revenue,
        orders: item.orders,
      }))
    }

    const deliveryRate = rangeOrdersCount > 0
      ? Math.round((statusMap.DELIVERED / rangeOrdersCount) * 100)
      : 100

    const cartRecoveryRate = incompleteOrdersCount > 0
      ? Math.round((recoveredIncompleteCount / incompleteOrdersCount) * 100)
      : 0

    // Fetch recent live orders in this range
    const recentOrders = await prisma.order.findMany({
      where: { createdAt: { gte: startDate, lte: endDate } },
      take: 10,
      orderBy: { createdAt: 'desc' },
      include: {
        items: { take: 2 },
        payment: true,
      },
    })

    return NextResponse.json({
      success: true,
      data: {
        rangeInfo: {
          range,
          rangeLabel,
          startDate: format(startDate, 'yyyy-MM-dd'),
          endDate: format(endDate, 'yyyy-MM-dd'),
        },
        cards: {
          rangeSales: rangeRevenue,
          rangeOrders: rangeOrdersCount,
          todaySales: todayRevenue,
          todayOrders,
          totalSales: totalRevenue,
          totalOrders: totalOrdersAllTime,
          aov,
          pendingOrders: statusMap.PENDING,
          confirmedOrders: statusMap.CONFIRMED,
          processingOrders: statusMap.PROCESSING + statusMap.PACKED + statusMap.SHIPPED + statusMap.OUT_FOR_DELIVERY,
          deliveredOrders: statusMap.DELIVERED,
          cancelledOrders: statusMap.CANCELLED,
          deliveryRate,
          totalCustomers,
          newCustomersRange,
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
        chartData,
        topProducts,
        recentOrders,
      },
    })
  } catch (err) {
    console.error('Analytics error:', err)
    return NextResponse.json({ error: 'Failed to fetch analytics' }, { status: 500 })
  }
}
