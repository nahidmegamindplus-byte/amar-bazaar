import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/auth'

export async function GET(req: NextRequest) {
  const { error } = await requireAdmin(req)
  if (error) return error
  const sections = await prisma.homepageSection.findMany({ orderBy: { sortOrder: 'asc' } })
  return NextResponse.json({ success: true, data: sections })
}

export async function PATCH(req: NextRequest) {
  const { error } = await requireAdmin(req)
  if (error) return error
  const body = await req.json()
  const { id, ...data } = body
  const section = await prisma.homepageSection.update({ where: { id }, data })
  return NextResponse.json({ success: true, data: section })
}

export async function POST(req: NextRequest) {
  const { error } = await requireAdmin(req)
  if (error) return error
  const body = await req.json()
  // Bulk update sections order
  if (body.sections) {
    await Promise.all(
      body.sections.map((s: { id: string; sortOrder: number; isActive: boolean }) =>
        prisma.homepageSection.update({ where: { id: s.id }, data: { sortOrder: s.sortOrder, isActive: s.isActive } })
      )
    )
    return NextResponse.json({ success: true })
  }
  return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
}
