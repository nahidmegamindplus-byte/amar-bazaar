import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/auth'
import { z } from 'zod'

const settingsSchema = z.record(z.string())

export async function GET(req: NextRequest) {
  const { error } = await requireAdmin(req)
  if (error) return error
  const { searchParams } = new URL(req.url)
  const group = searchParams.get('group')
  const settings = await prisma.setting.findMany({ where: group ? { group } : undefined })
  const result = Object.fromEntries(settings.map(s => [s.key, s.value]))
  return NextResponse.json({ success: true, data: result })
}

export async function POST(req: NextRequest) {
  const { error } = await requireAdmin(req)
  if (error) return error
  const body = await req.json()
  const { group = 'general', settings } = body

  if (!settings || typeof settings !== 'object') {
    return NextResponse.json({ error: 'Invalid settings data' }, { status: 400 })
  }

  await Promise.all(
    Object.entries(settings).map(([key, value]) =>
      prisma.setting.upsert({
        where: { key },
        update: { value: String(value) },
        create: { key, value: String(value), group },
      })
    )
  )

  return NextResponse.json({ success: true })
}
