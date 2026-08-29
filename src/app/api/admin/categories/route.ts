import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/auth'

// Admin: GET/POST categories
export async function GET(req: NextRequest) {
  const { error } = await requireAdmin(req)
  if (error) return error
  const categories = await prisma.category.findMany({
    orderBy: { sortOrder: 'asc' },
    include: { subcategories: { orderBy: { sortOrder: 'asc' } }, _count: { select: { products: true } } },
  })
  return NextResponse.json({ success: true, data: categories })
}

export async function POST(req: NextRequest) {
  const { error, session } = await requireAdmin(req)
  if (error) return error
  const body = await req.json()
  const { name, slug, description, image, banner, sortOrder, isActive, seoTitle, seoDesc, seoKeywords } = body

  const existing = await prisma.category.findFirst({ where: { slug } })
  if (existing) return NextResponse.json({ error: 'Slug already exists' }, { status: 409 })

  const category = await prisma.category.create({
    data: { name, slug, description, image, banner, sortOrder: sortOrder || 0, isActive: isActive ?? true, seoTitle, seoDesc, seoKeywords },
  })
  return NextResponse.json({ success: true, data: category }, { status: 201 })
}

export async function PATCH(req: NextRequest) {
  const { error } = await requireAdmin(req)
  if (error) return error
  const body = await req.json()
  const { id, ...data } = body
  const category = await prisma.category.update({ where: { id }, data })
  return NextResponse.json({ success: true, data: category })
}

export async function DELETE(req: NextRequest) {
  const { error } = await requireAdmin(req)
  if (error) return error
  const { searchParams } = new URL(req.url)
  const id = searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 })
  await prisma.category.delete({ where: { id } })
  return NextResponse.json({ success: true })
}
