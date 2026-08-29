import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSessionFromRequest } from '@/lib/auth'
import { generateOrderNumber } from '@/lib/auth'
import { sendOrderConfirmation } from '@/lib/email'
import { createAdminNotification } from '@/lib/notifications'
import { z } from 'zod'

const checkoutSchema = z.object({
  shippingName: z.string().min(2),
  shippingPhone: z.string().min(11),
  shippingEmail: z.string().email().optional().or(z.literal('')),
  shippingDiv: z.string().min(1),
  shippingDist: z.string().min(1),
  shippingArea: z.string().min(1),
  shippingAddress: z.string().min(5),
  deliveryNote: z.string().optional(),
  zoneId: z.string().optional(),
  deliveryRateId: z.string().optional(),
  couponCode: z.string().optional(),
  paymentMethod: z.enum(['COD', 'BKASH', 'NAGAD', 'ROCKET', 'ONLINE']),
  checkoutSessionId: z.string().optional(),
  items: z.array(z.object({
    productId: z.string(),
    variantId: z.string().optional(),
    quantity: z.number().int().min(1),
  })),
})

export async function POST(req: NextRequest) {
  try {
    const session = await getSessionFromRequest(req)
    const body = await req.json()
    const parsed = checkoutSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid order data', details: parsed.error.flatten() }, { status: 400 })
    }

    const data = parsed.data

    // Validate items and calculate totals (SERVER-SIDE, never trust client prices)
    let subtotal = 0
    let discount = 0
    const orderItems: any[] = []

    for (const item of data.items) {
      const product = await prisma.product.findFirst({
        where: { id: item.productId, isPublished: true },
        include: { variants: true },
      })

      if (!product) {
        return NextResponse.json({ error: `Product ${item.productId} not found` }, { status: 400 })
      }

      let unitPrice = product.regularPrice
      let salePrice = product.salePrice || undefined
      let availableStock = product.stock
      let variantName: string | undefined

      if (item.variantId) {
        const variant = product.variants.find((v) => v.id === item.variantId)
        if (!variant) return NextResponse.json({ error: 'Variant not found' }, { status: 400 })
        unitPrice = variant.price || product.regularPrice
        salePrice = variant.salePrice || product.salePrice || undefined
        availableStock = variant.stock
        variantName = variant.name
      }

      // Stock check (prevent overselling)
      if (!product.isPreOrder && availableStock < item.quantity) {
        return NextResponse.json({ error: `Insufficient stock for "${product.name}". Available: ${availableStock}` }, { status: 400 })
      }

      const effectivePrice = salePrice || unitPrice
      const itemTotal = effectivePrice * item.quantity
      const itemDiscount = salePrice ? (unitPrice - salePrice) * item.quantity : 0

      subtotal += itemTotal + itemDiscount
      discount += itemDiscount

      orderItems.push({
        productId: item.productId,
        variantId: item.variantId || null,
        productName: product.name,
        variantName: variantName || null,
        sku: product.sku || null,
        thumbnail: product.thumbnail,
        quantity: item.quantity,
        unitPrice,
        salePrice: salePrice || null,
        total: itemTotal,
      })
    }

    // Delivery charge (server-side calculation)
    let deliveryCharge = 0
    if (data.zoneId) {
      const zone = await prisma.deliveryZone.findUnique({ where: { id: data.zoneId }, include: { rates: true } })
      if (zone && zone.rates.length > 0) {
        const rate = zone.rates.find((r) => r.isActive)
        if (rate) {
          const orderSubtotal = subtotal - discount
          deliveryCharge = rate.freeThreshold && orderSubtotal >= rate.freeThreshold ? 0 : rate.charge
        }
      }
    }

    // Coupon validation
    let couponDiscount = 0
    let couponId: string | undefined
    if (data.couponCode) {
      const coupon = await prisma.coupon.findFirst({
        where: {
          code: data.couponCode.toUpperCase(),
          isActive: true,
          OR: [{ endDate: null }, { endDate: { gte: new Date() } }],
          AND: [{ OR: [{ startDate: null }, { startDate: { lte: new Date() } }] }],
        },
      })

      if (coupon) {
        const orderSubtotal = subtotal - discount
        if (!coupon.minOrder || orderSubtotal >= coupon.minOrder) {
          if (coupon.type === 'PERCENTAGE') {
            couponDiscount = (orderSubtotal * coupon.value) / 100
            if (coupon.maxDiscount) couponDiscount = Math.min(couponDiscount, coupon.maxDiscount)
          } else if (coupon.type === 'FIXED') {
            couponDiscount = Math.min(coupon.value, orderSubtotal)
          } else if (coupon.type === 'FREE_DELIVERY') {
            couponDiscount = deliveryCharge
            deliveryCharge = 0
          }
          couponId = coupon.id
        }
      }
    }

    const taxSettings = await prisma.setting.findMany({ where: { group: 'tax' } })
    const taxEnabled = taxSettings.find((s) => s.key === 'tax_enabled')?.value === 'true'
    const taxPct = parseFloat(taxSettings.find((s) => s.key === 'tax_percentage')?.value || '0')
    const taxableAmount = subtotal - discount - couponDiscount + deliveryCharge
    const taxAmount = taxEnabled ? (taxableAmount * taxPct) / 100 : 0
    const total = taxableAmount + taxAmount

    const orderNumber = generateOrderNumber()

    // Atomic inventory deduction + order creation
    const order = await prisma.$transaction(async (tx) => {
      // Deduct stock
      for (const item of data.items) {
        if (item.variantId) {
          await tx.productVariant.update({
            where: { id: item.variantId },
            data: { stock: { decrement: item.quantity } },
          })
        } else {
          await tx.product.update({
            where: { id: item.productId },
            data: { stock: { decrement: item.quantity }, soldCount: { increment: item.quantity } },
          })
        }

        // Inventory transaction log
        await tx.inventoryTransaction.create({
          data: {
            productId: item.productId,
            type: 'ORDER',
            quantity: -item.quantity,
            note: `Order #${orderNumber}`,
            reference: orderNumber,
          },
        })
      }

      // Update coupon usage
      if (couponId) {
        await tx.coupon.update({ where: { id: couponId }, data: { usedCount: { increment: 1 } } })
        if (session?.userId) {
          await tx.couponUsage.create({ data: { couponId, userId: session.userId, orderId: undefined } })
        }
      }

      // Create order
      const newOrder = await tx.order.create({
        data: {
          orderNumber,
          userId: session?.userId || undefined,
          shippingName: data.shippingName,
          shippingPhone: data.shippingPhone,
          shippingEmail: data.shippingEmail || undefined,
          shippingDiv: data.shippingDiv,
          shippingDist: data.shippingDist,
          shippingArea: data.shippingArea,
          shippingAddress: data.shippingAddress,
          deliveryNote: data.deliveryNote,
          zoneId: data.zoneId || undefined,
          deliveryCharge,
          subtotal,
          discount,
          couponDiscount,
          couponCode: data.couponCode,
          couponId: couponId || undefined,
          taxAmount,
          total,
          paymentMethod: data.paymentMethod,
          paymentStatus: data.paymentMethod === 'COD' ? 'PENDING' : 'PENDING',
          status: 'PENDING',
          items: { create: orderItems },
          statusHistory: {
            create: { status: 'PENDING', note: 'Order placed', createdBy: session?.userId || 'guest' }
          },
          payment: {
            create: { amount: total, method: data.paymentMethod, status: 'PENDING' }
          }
        },
        include: { items: true },
      })

      // Clear cart
      if (session?.userId) {
        await tx.cart.updateMany({ where: { userId: session.userId }, data: { couponId: null } })
        await tx.cartItem.deleteMany({ where: { cart: { userId: session.userId } } })
      }

      return newOrder
    })

    // Mark matching incomplete order as RECOVERED
    if (data.checkoutSessionId) {
      prisma.incompleteOrder.updateMany({
        where: { sessionId: data.checkoutSessionId },
        data: { status: 'RECOVERED', convertedOrderId: order.id }
      }).catch(() => {})
    } else if (data.shippingPhone) {
      prisma.incompleteOrder.updateMany({
        where: { phone: data.shippingPhone, status: { not: 'RECOVERED' } },
        data: { status: 'RECOVERED', convertedOrderId: order.id }
      }).catch(() => {})
    }

    // Send confirmation email (non-blocking)
    sendOrderConfirmation(order).catch(() => {})

    // Notify admins
    createAdminNotification(
      'ORDER_PLACED',
      'New Order Received',
      `Order #${orderNumber} from ${data.shippingName} - ৳${total.toLocaleString()}`,
      `/admin/orders/${order.id}`
    ).catch(() => {})

    return NextResponse.json({ success: true, data: { orderId: order.id, orderNumber } }, { status: 201 })
  } catch (err) {
    console.error('Order creation error:', err)
    return NextResponse.json({ error: 'Failed to place order' }, { status: 500 })
  }
}

export async function GET(req: NextRequest) {
  try {
    const session = await getSessionFromRequest(req)
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { searchParams } = new URL(req.url)
    const orderNumber = searchParams.get('orderNumber')
    const phone = searchParams.get('phone')

    // Public tracking
    if (orderNumber && phone) {
      const order = await prisma.order.findFirst({
        where: { orderNumber, shippingPhone: phone },
        include: { items: true, statusHistory: { orderBy: { createdAt: 'asc' } } },
      })
      if (!order) return NextResponse.json({ error: 'Order not found' }, { status: 404 })
      return NextResponse.json({ success: true, data: order })
    }

    // Customer orders
    const orders = await prisma.order.findMany({
      where: { userId: session.userId },
      include: { items: { take: 3 } },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ success: true, data: orders })
  } catch (err) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
