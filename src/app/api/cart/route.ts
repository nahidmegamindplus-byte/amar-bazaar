import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSessionFromRequest } from '@/lib/auth'

async function getOrCreateCart(req: NextRequest, userId?: string) {
  const sessionId = req.cookies.get('cart_session')?.value

  if (userId) {
    let cart = await prisma.cart.findFirst({
      where: { userId },
      include: {
        items: {
          include: {
            product: { select: { id: true, name: true, slug: true, thumbnail: true, regularPrice: true, salePrice: true, stock: true, isFreeDelivery: true } },
            variant: true,
          },
        },
        coupon: true,
      },
    })
    if (!cart) {
      cart = await prisma.cart.create({ data: { userId }, include: { items: { include: { product: true, variant: true } }, coupon: true } })
    }
    return cart
  }

  if (sessionId) {
    const cart = await prisma.cart.findFirst({
      where: { sessionId },
      include: {
        items: {
          include: {
            product: { select: { id: true, name: true, slug: true, thumbnail: true, regularPrice: true, salePrice: true, stock: true, isFreeDelivery: true } },
            variant: true,
          },
        },
        coupon: true,
      },
    })
    if (cart) return cart
  }

  return null
}

export async function GET(req: NextRequest) {
  try {
    const session = await getSessionFromRequest(req)
    const cart = await getOrCreateCart(req, session?.userId)

    if (!cart) {
      return NextResponse.json({ success: true, data: { items: [], coupon: null, sessionId: null } })
    }

    return NextResponse.json({ success: true, data: cart })
  } catch (err) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSessionFromRequest(req)
    const body = await req.json()
    const { productId, variantId, quantity = 1 } = body

    if (!productId) return NextResponse.json({ error: 'Product ID required' }, { status: 400 })

    // Validate product
    const product = await prisma.product.findFirst({
      where: { id: productId, isPublished: true },
      include: { variants: true },
    })
    if (!product) return NextResponse.json({ error: 'Product not found' }, { status: 404 })

    // Check stock
    let availableStock = product.stock
    if (variantId) {
      const variant = product.variants.find((v) => v.id === variantId)
      if (!variant) return NextResponse.json({ error: 'Variant not found' }, { status: 404 })
      availableStock = variant.stock
    }
    if (!product.isPreOrder && availableStock < quantity) {
      return NextResponse.json({ error: `Only ${availableStock} units available` }, { status: 400 })
    }

    let cartId: string

    if (session?.userId) {
      let cart = await prisma.cart.findFirst({ where: { userId: session.userId } })
      if (!cart) cart = await prisma.cart.create({ data: { userId: session.userId } })
      cartId = cart.id
    } else {
      // Guest cart
      const sessionId = req.cookies.get('cart_session')?.value || Math.random().toString(36).slice(2)
      let cart = await prisma.cart.findFirst({ where: { sessionId } })
      if (!cart) cart = await prisma.cart.create({ data: { sessionId } })
      cartId = cart.id

      // We'll set the cookie in the response below
      const existingItem = await prisma.cartItem.findFirst({
        where: { cartId, productId, variantId: variantId || null },
      })

      let updatedItem
      if (existingItem) {
        const newQty = Math.min(existingItem.quantity + quantity, availableStock || 99)
        updatedItem = await prisma.cartItem.update({ where: { id: existingItem.id }, data: { quantity: newQty } })
      } else {
        updatedItem = await prisma.cartItem.create({ data: { cartId, productId, variantId: variantId || null, quantity } })
      }

      const response = NextResponse.json({ success: true, data: updatedItem })
      if (!req.cookies.get('cart_session')?.value) {
        response.cookies.set('cart_session', sessionId, { maxAge: 60 * 60 * 24 * 30, path: '/' })
      }
      return response
    }

    const existingItem = await prisma.cartItem.findFirst({
      where: { cartId, productId, variantId: variantId || null },
    })

    let result
    if (existingItem) {
      const newQty = Math.min(existingItem.quantity + quantity, availableStock || 99)
      result = await prisma.cartItem.update({ where: { id: existingItem.id }, data: { quantity: newQty } })
    } else {
      result = await prisma.cartItem.create({ data: { cartId, productId, variantId: variantId || null, quantity } })
    }

    return NextResponse.json({ success: true, data: result })
  } catch (err) {
    console.error('Cart add error:', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await getSessionFromRequest(req)
    const { searchParams } = new URL(req.url)
    const itemId = searchParams.get('itemId')

    if (!itemId) return NextResponse.json({ error: 'Item ID required' }, { status: 400 })

    const item = await prisma.cartItem.findUnique({
      where: { id: itemId },
      include: { cart: true },
    })

    if (!item) return NextResponse.json({ error: 'Item not found' }, { status: 404 })

    // Security check
    if (session?.userId && item.cart.userId !== session.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    await prisma.cartItem.delete({ where: { id: itemId } })
    return NextResponse.json({ success: true })
  } catch (err) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await getSessionFromRequest(req)
    const body = await req.json()
    const { itemId, quantity } = body

    if (!itemId || quantity < 1) return NextResponse.json({ error: 'Invalid input' }, { status: 400 })

    const item = await prisma.cartItem.findUnique({
      where: { id: itemId },
      include: { cart: true, product: true, variant: true },
    })
    if (!item) return NextResponse.json({ error: 'Item not found' }, { status: 404 })

    // Stock validation
    const availableStock = item.variant ? item.variant.stock : item.product.stock
    if (!item.product.isPreOrder && quantity > availableStock) {
      return NextResponse.json({ error: `Only ${availableStock} available` }, { status: 400 })
    }

    const updated = await prisma.cartItem.update({ where: { id: itemId }, data: { quantity } })
    return NextResponse.json({ success: true, data: updated })
  } catch (err) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
