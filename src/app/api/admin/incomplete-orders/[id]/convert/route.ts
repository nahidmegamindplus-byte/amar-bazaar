import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdmin, generateOrderNumber } from '@/lib/auth'

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error, session } = await requireAdmin(req)
  if (error) return error

  try {
    const { id } = await params
    const incompleteOrder = await prisma.incompleteOrder.findUnique({
      where: { id },
    })

    if (!incompleteOrder) {
      return NextResponse.json({ error: 'Incomplete order not found' }, { status: 404 })
    }

    if (incompleteOrder.convertedOrderId) {
      return NextResponse.json({ error: 'Order already converted' }, { status: 400 })
    }

    let parsedItems: any[] = []
    try {
      parsedItems = incompleteOrder.items ? JSON.parse(incompleteOrder.items) : []
    } catch {
      parsedItems = []
    }

    if (!parsedItems || parsedItems.length === 0) {
      return NextResponse.json({ error: 'No items in this incomplete checkout to convert' }, { status: 400 })
    }

    const orderNumber = generateOrderNumber()

    // Build order items
    const orderItemsToCreate = parsedItems.map((item: any) => ({
      productId: item.productId,
      variantId: item.variantId || null,
      productName: item.productName || 'Product',
      variantName: item.variantName || null,
      sku: item.sku || null,
      thumbnail: item.thumbnail || null,
      quantity: item.quantity || 1,
      unitPrice: Number(item.unitPrice || item.price || 0),
      salePrice: item.salePrice ? Number(item.salePrice) : null,
      total: Number(item.total || (item.salePrice || item.unitPrice || item.price || 0) * (item.quantity || 1)),
    }))

    const subtotal = incompleteOrder.subtotal || orderItemsToCreate.reduce((acc, it) => acc + it.total, 0)
    const deliveryCharge = incompleteOrder.deliveryCharge || 60
    const discount = incompleteOrder.discount || 0
    const total = Math.max(0, subtotal + deliveryCharge - discount)
    const adminIdentifier = session?.email || session?.userId || 'Admin'

    const createdOrder = await prisma.$transaction(async (tx) => {
      const order = await tx.order.create({
        data: {
          orderNumber,
          userId: incompleteOrder.userId || undefined,
          shippingName: incompleteOrder.customerName || 'Valued Customer',
          shippingPhone: incompleteOrder.phone || '01700000000',
          shippingEmail: incompleteOrder.email || undefined,
          shippingDiv: incompleteOrder.division || 'Dhaka',
          shippingDist: incompleteOrder.district || 'Dhaka',
          shippingArea: incompleteOrder.area || 'City Area',
          shippingAddress: incompleteOrder.address || 'Address not specified',
          deliveryNote: incompleteOrder.deliveryNote || 'Recovered from Incomplete Order',
          deliveryCharge,
          subtotal,
          discount,
          total,
          paymentMethod: incompleteOrder.paymentMethod || 'COD',
          paymentStatus: 'PENDING',
          status: 'PENDING',
          internalNote: `Converted from Incomplete Order (${incompleteOrder.id}) by admin ${adminIdentifier}`,
          items: {
            create: orderItemsToCreate,
          },
          statusHistory: {
            create: {
              status: 'PENDING',
              note: `Order recovered from abandoned checkout by admin ${adminIdentifier}`,
              createdBy: adminIdentifier,
            },
          },
          payment: {
            create: {
              amount: total,
              method: incompleteOrder.paymentMethod || 'COD',
              status: 'PENDING',
            },
          },
        },
        include: { items: true },
      })


      // Update incomplete order status
      await tx.incompleteOrder.update({
        where: { id: incompleteOrder.id },
        data: {
          status: 'RECOVERED',
          convertedOrderId: order.id,
          adminNote: incompleteOrder.adminNote
            ? `${incompleteOrder.adminNote}\n[Recovered as Order #${orderNumber}]`
            : `Recovered as Order #${orderNumber}`,
        },
      })

      return order
    })

    return NextResponse.json({
      success: true,
      message: 'Order successfully created and recovered!',
      data: {
        orderId: createdOrder.id,
        orderNumber: createdOrder.orderNumber,
      },
    })
  } catch (err: any) {
    console.error('Error converting incomplete order:', err)
    return NextResponse.json({ success: false, error: 'Failed to convert order' }, { status: 500 })
  }
}
