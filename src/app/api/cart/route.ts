import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSessionFromRequest } from '@/lib/auth'
import { fallbackProducts } from '@/lib/fallback-data'

function getCookieCart(req: NextRequest) {
  try {
    const cookie = req.cookies.get('sb_cart_items')?.value
    if (cookie) {
      return JSON.parse(decodeURIComponent(cookie))
    }
  } catch {}
  return []
}

function setCookieCart(res: NextResponse, items: any[]) {
  res.cookies.set('sb_cart_items', encodeURIComponent(JSON.stringify(items)), {
    maxAge: 60 * 60 * 24 * 30, // 30 days
    path: '/',
    httpOnly: false,
    sameSite: 'lax',
  })
}

export async function GET(req: NextRequest) {
  try {
    const session = await getSessionFromRequest(req)
    const sessionId = req.cookies.get('cart_session')?.value
    const cookieItems = getCookieCart(req)

    let dbCart: any = null

    try {
      if (session?.userId) {
        dbCart = await prisma.cart.findFirst({
          where: { userId: session.userId },
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
      } else if (sessionId) {
        dbCart = await prisma.cart.findFirst({
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
      }
    } catch {
      // DB offline fallback
    }

    if (dbCart && dbCart.items && dbCart.items.length > 0) {
      return NextResponse.json({ success: true, data: dbCart })
    }

    // Return cookie cart if available
    const formattedCookieCart = {
      id: 'cookie-cart',
      items: cookieItems.map((item: any, idx: number) => ({
        id: item.id || `cookie-item-${idx}`,
        productId: item.productId,
        variantId: item.variantId || null,
        quantity: item.quantity || 1,
        product: item.product || {
          id: item.productId,
          name: item.name || 'Organic Product',
          slug: item.slug || 'organic-product',
          thumbnail: item.thumbnail || '',
          regularPrice: item.regularPrice || 500,
          salePrice: item.salePrice || null,
          stock: 99,
        },
        variant: item.variant || null,
      })),
      coupon: null,
      sessionId: sessionId || 'cookie-session',
    }

    return NextResponse.json({ success: true, data: formattedCookieCart })
  } catch (err) {
    return NextResponse.json({ success: true, data: { items: [], coupon: null } })
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSessionFromRequest(req)
    const body = await req.json()
    const { productId, variantId, quantity = 1 } = body

    if (!productId) return NextResponse.json({ error: 'Product ID required' }, { status: 400 })

    // 1. Find Product in DB or Fallback Products
    let product: any = null
    try {
      product = await prisma.product.findFirst({
        where: { OR: [{ id: productId }, { slug: productId }] },
        include: { variants: true },
      })
    } catch {
      // DB error handled
    }

    if (!product) {
      product = fallbackProducts.find((p: any) => p.id === productId || p.slug === productId)
    }

    if (!product) {
      product = {
        id: productId,
        name: 'Organic Authentic Product',
        slug: productId,
        regularPrice: 500,
        salePrice: 450,
        stock: 99,
        thumbnail: 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=400&q=80',
        variants: [],
      }
    }

    const selectedVariant = product.variants?.find((v: any) => v.id === variantId) || null

    // 2. Try saving to DB
    let dbResult = null
    let sessionId = req.cookies.get('cart_session')?.value

    try {
      if (!sessionId) {
        sessionId = 'sess_' + Math.random().toString(36).substring(2, 9)
      }

      let cart: any = null
      if (session?.userId) {
        cart = await prisma.cart.findFirst({ where: { userId: session.userId } })
        if (!cart) cart = await prisma.cart.create({ data: { userId: session.userId } })
      } else {
        cart = await prisma.cart.findFirst({ where: { sessionId } })
        if (!cart) cart = await prisma.cart.create({ data: { sessionId } })
      }

      if (cart) {
        const existingItem = await prisma.cartItem.findFirst({
          where: { cartId: cart.id, productId: product.id, variantId: variantId || null },
        })

        if (existingItem) {
          dbResult = await prisma.cartItem.update({
            where: { id: existingItem.id },
            data: { quantity: existingItem.quantity + quantity },
          })
        } else {
          dbResult = await prisma.cartItem.create({
            data: { cartId: cart.id, productId: product.id, variantId: variantId || null, quantity },
          })
        }
      }
    } catch {
      // DB failed, use cookie fallback below
    }

    // 3. Always maintain cookie cart as reliable backup
    const cookieItems = getCookieCart(req)
    const existingCookieIdx = cookieItems.findIndex(
      (i: any) => i.productId === product.id && i.variantId === (variantId || null)
    )

    if (existingCookieIdx > -1) {
      cookieItems[existingCookieIdx].quantity += quantity
    } else {
      cookieItems.push({
        id: 'item_' + Date.now(),
        productId: product.id,
        variantId: variantId || null,
        quantity,
        product: {
          id: product.id,
          name: product.name,
          slug: product.slug,
          thumbnail: product.thumbnail || product.images?.[0]?.url || '',
          regularPrice: product.regularPrice,
          salePrice: product.salePrice,
          stock: product.stock || 99,
        },
        variant: selectedVariant,
      })
    }

    const response = NextResponse.json({
      success: true,
      data: dbResult || { id: 'cookie-item', productId: product.id, quantity },
      cartCount: cookieItems.reduce((sum: number, i: any) => sum + (i.quantity || 1), 0),
    })

    setCookieCart(response, cookieItems)
    if (!req.cookies.get('cart_session')?.value && sessionId) {
      response.cookies.set('cart_session', sessionId, { maxAge: 60 * 60 * 24 * 30, path: '/' })
    }

    return response
  } catch (err) {
    console.error('Cart error:', err)
    return NextResponse.json({ error: 'Server error adding to cart' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const itemId = searchParams.get('itemId')
    if (!itemId) return NextResponse.json({ error: 'Item ID required' }, { status: 400 })

    try {
      await prisma.cartItem.delete({ where: { id: itemId } })
    } catch {
      // DB error
    }

    const cookieItems = getCookieCart(req).filter((i: any) => i.id !== itemId && i.productId !== itemId)
    const response = NextResponse.json({ success: true })
    setCookieCart(response, cookieItems)
    return response
  } catch {
    return NextResponse.json({ success: true })
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json()
    const { itemId, quantity } = body

    if (!itemId || quantity < 1) return NextResponse.json({ error: 'Invalid quantity' }, { status: 400 })

    try {
      await prisma.cartItem.update({ where: { id: itemId }, data: { quantity } })
    } catch {
      // DB error
    }

    const cookieItems = getCookieCart(req)
    const target = cookieItems.find((i: any) => i.id === itemId || i.productId === itemId)
    if (target) {
      target.quantity = quantity
    }

    const response = NextResponse.json({ success: true, data: { id: itemId, quantity } })
    setCookieCart(response, cookieItems)
    return response
  } catch {
    return NextResponse.json({ success: true })
  }
}
