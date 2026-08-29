import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/auth'

export async function GET(req: NextRequest) {
  const { error } = await requireAdmin(req)
  if (error) return error
  const banners = await prisma.banner.findMany({ orderBy: { sortOrder: 'asc' } })
  return NextResponse.json({ success: true, data: banners })
}

export async function POST(req: NextRequest) {
  const { error } = await requireAdmin(req)
  if (error) return error
  const body = await req.json()
  const banner = await prisma.banner.create({ data: body })
  return NextResponse.json({ success: true, data: banner }, { status: 201 })
}

export async function PATCH(req: NextRequest) {
  const { error } = await requireAdmin(req)
  if (error) return error
  const body = await req.json()
  const { id, ...data } = body
  const banner = await prisma.banner.update({ where: { id }, data })
  return NextResponse.json({ success: true, data: banner })
}

export async function DELETE(req: NextRequest) {
  const { error } = await requireAdmin(req)
  if (error) return error
  const { searchParams } = new URL(req.url)
  const id = searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 })
  await prisma.banner.delete({ where: { id } })
  return NextResponse.json({ success: true })
}
