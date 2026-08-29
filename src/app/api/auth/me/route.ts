import { NextRequest, NextResponse } from 'next/server'
import { getSessionFromRequest } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  const session = await getSessionFromRequest(req)
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      role: true,
      status: true,
      avatar: true,
      emailVerified: true,
      createdAt: true,
      addresses: {
        orderBy: { isDefault: 'desc' },
        take: 1,
      },
      _count: {
        select: { orders: true, reviews: true },
      },
    },
  })

  if (!user || user.status === 'BLOCKED') {
    return NextResponse.json({ error: 'User not found or blocked' }, { status: 401 })
  }

  return NextResponse.json({ success: true, user })
}
