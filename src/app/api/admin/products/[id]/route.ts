import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/auth'
import { logActivity } from '@/lib/notifications'

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { error } = await requireAdmin(req)
  if (error) return error
  const { id } = await params
  const product = await prisma.product.findUnique({
    where: { id },
    include: { images: { orderBy: { sortOrder: 'asc' } }, variants: { orderBy: { sortOrder: 'asc' } }, attributes: { orderBy: { sortOrder: 'asc' } }, category: true, brand: true },
  })
  if (!product) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json({ success: true, data: product })
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { error, session } = await requireAdmin(req)
  if (error) return error
  const { id } = await params
  const body = await req.json()

  try {
    const { images, variants, attributes, tags, ...updateData } = body
    const serialized = { ...updateData }
    if (tags !== undefined) serialized.tags = JSON.stringify(tags)

    const product = await prisma.product.update({
      where: { id },
      data: serialized,
    })

    // Update relations if provided
    if (images !== undefined) {
      await prisma.productImage.deleteMany({ where: { productId: id } })
      if (images.length > 0) await prisma.productImage.createMany({ data: images.map((img: any) => ({ ...img, productId: id })) })
    }
    if (variants !== undefined) {
      await prisma.productVariant.deleteMany({ where: { productId: id } })
      if (variants.length > 0) await prisma.productVariant.createMany({ data: variants.map((v: any) => ({ ...v, productId: id })) })
    }
    if (attributes !== undefined) {
      await prisma.productAttribute.deleteMany({ where: { productId: id } })
      if (attributes.length > 0) await prisma.productAttribute.createMany({ data: attributes.map((a: any) => ({ ...a, productId: id })) })
    }

    await logActivity({ adminId: session!.userId, action: 'PRODUCT_UPDATED', target: 'Product', targetId: id, details: `Updated product: ${product.name}` })

    return NextResponse.json({ success: true, data: product })
  } catch (err) {
    return NextResponse.json({ error: 'Update failed' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { error, session } = await requireAdmin(req)
  if (error) return error
  const { id } = await params
  try {
    const product = await prisma.product.findUnique({ where: { id } })
    await prisma.product.delete({ where: { id } })
    await logActivity({ adminId: session!.userId, action: 'PRODUCT_DELETED', target: 'Product', targetId: id, details: `Deleted product: ${product?.name}` })
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Delete failed' }, { status: 500 })
  }
}
