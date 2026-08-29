import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/auth'
import { getPaginationParams, paginationMeta } from '@/lib/api-helpers'
import { logActivity } from '@/lib/notifications'

export async function GET(req: NextRequest) {
  const { error } = await requireAdmin(req)
  if (error) return error

  const { searchParams } = new URL(req.url)
  const { page, limit, skip } = getPaginationParams(searchParams)
  const status = searchParams.get('status')
  const search = searchParams.get('search')
  const paymentMethod = searchParams.get('payment')
  const dateFrom = searchParams.get('dateFrom')
  const dateTo = searchParams.get('dateTo')

  const where: any = {}
  if (status) where.status = status
  if (paymentMethod) where.paymentMethod = paymentMethod
  if (search) {
    where.OR = [
      { orderNumber: { contains: search } },
      { shippingName: { contains: search } },
      { shippingPhone: { contains: search } },
    ]
  }
  if (dateFrom || dateTo) {
    where.createdAt = {}
    if (dateFrom) where.createdAt.gte = new Date(dateFrom)
    if (dateTo) where.createdAt.lte = new Date(dateTo)
  }

  const [orders, total] = await Promise.all([
    prisma.order.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        items: { include: { product: { select: { name: true, thumbnail: true } } } },
        payment: true,
        zone: true,
      },
    }),
    prisma.order.count({ where }),
  ])

  return NextResponse.json({ success: true, data: orders, pagination: paginationMeta(total, page, limit) })
}

export async function PATCH(req: NextRequest) {
  const { error, session } = await requireAdmin(req)
  if (error) return error

  const body = await req.json()
  const { orderId, status, note, trackingNumber } = body

  try {
    const order = await prisma.order.update({
      where: { id: orderId },
      data: {
        status,
        trackingNumber: trackingNumber || undefined,
        statusHistory: {
          create: { status, note, createdBy: session!.userId }
        }
      },
    })

    // Auto-update payment status for COD
    if (status === 'DELIVERED' && order.paymentMethod === 'COD') {
      await prisma.payment.updateMany({ where: { orderId }, data: { status: 'PAID', paidAt: new Date() } })
      await prisma.order.update({ where: { id: orderId }, data: { paymentStatus: 'PAID' } })
    }

    await logActivity({ adminId: session!.userId, action: 'ORDER_STATUS_UPDATED', target: 'Order', targetId: orderId, details: `Order ${order.orderNumber} status: ${status}` })

    return NextResponse.json({ success: true, data: order })
  } catch (err) {
    return NextResponse.json({ error: 'Update failed' }, { status: 500 })
  }
}
