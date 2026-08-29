import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSessionFromRequest } from '@/lib/auth'

export async function POST(req: NextRequest) {
  try {
    const session = await getSessionFromRequest(req)
    const body = await req.json()

    const {
      sessionId,
      customerName,
      phone,
      email,
      division,
      district,
      area,
      address,
      deliveryNote,
      paymentMethod = 'COD',
      couponCode,
      subtotal = 0,
      deliveryCharge = 0,
      discount = 0,
      total = 0,
      items = [],
      lastStep = 'CHECKOUT_PAGE'
    } = body

    // Need at least a phone or name or items to be meaningful
    const trimmedPhone = phone ? String(phone).trim() : ''
    const trimmedName = customerName ? String(customerName).trim() : ''
    const hasItems = Array.isArray(items) && items.length > 0

    if (!trimmedPhone && !trimmedName && !hasItems) {
      return NextResponse.json({ success: false, message: 'No relevant checkout data provided' }, { status: 400 })
    }

    const ipAddress = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || undefined
    const userAgent = req.headers.get('user-agent') || undefined
    const userId = session?.userId || undefined

    const draftSessionId = sessionId || `draft_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`

    // Check if draft already exists by sessionId
    const existing = await prisma.incompleteOrder.findUnique({
      where: { sessionId: draftSessionId }
    })

    const itemsJson = JSON.stringify(items)

    let savedRecord
    if (existing) {
      // If already marked as RECOVERED, keep status as RECOVERED
      savedRecord = await prisma.incompleteOrder.update({
        where: { id: existing.id },
        data: {
          userId: userId || existing.userId,
          customerName: trimmedName || existing.customerName,
          phone: trimmedPhone || existing.phone,
          email: email || existing.email,
          division: division || existing.division,
          district: district || existing.district,
          area: area || existing.area,
          address: address || existing.address,
          deliveryNote: deliveryNote || existing.deliveryNote,
          paymentMethod: paymentMethod || existing.paymentMethod,
          couponCode: couponCode || existing.couponCode,
          subtotal: Number(subtotal) || existing.subtotal,
          deliveryCharge: Number(deliveryCharge) || existing.deliveryCharge,
          discount: Number(discount) || existing.discount,
          total: Number(total) || existing.total,
          items: itemsJson !== '[]' ? itemsJson : existing.items,
          lastStep: lastStep || existing.lastStep,
          ipAddress: ipAddress || existing.ipAddress,
          userAgent: userAgent || existing.userAgent,
        }
      })
    } else {
      savedRecord = await prisma.incompleteOrder.create({
        data: {
          sessionId: draftSessionId,
          userId,
          customerName: trimmedName || undefined,
          phone: trimmedPhone || undefined,
          email: email || undefined,
          division: division || undefined,
          district: district || undefined,
          area: area || undefined,
          address: address || undefined,
          deliveryNote: deliveryNote || undefined,
          paymentMethod,
          couponCode: couponCode || undefined,
          subtotal: Number(subtotal) || 0,
          deliveryCharge: Number(deliveryCharge) || 0,
          discount: Number(discount) || 0,
          total: Number(total) || 0,
          items: itemsJson,
          status: 'NOT_CONTACTED',
          lastStep,
          ipAddress,
          userAgent,
        }
      })
    }

    return NextResponse.json({
      success: true,
      sessionId: draftSessionId,
      id: savedRecord.id,
    })
  } catch (error: any) {
    console.error('Error saving incomplete order draft:', error)
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 })
  }
}
