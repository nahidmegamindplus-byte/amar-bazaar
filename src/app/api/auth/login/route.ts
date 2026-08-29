import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { hashPassword, comparePassword, signToken, setAuthCookie } from '@/lib/auth'
import { logActivity } from '@/lib/notifications'
import { z } from 'zod'

const loginSchema = z.object({
  email: z.string().email().optional(),
  phone: z.string().optional(),
  password: z.string().min(6),
}).refine((data) => data.email || data.phone, {
  message: 'Email or phone is required',
})

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const parsed = loginSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid input', details: parsed.error.flatten() }, { status: 400 })
    }

    const { email, phone, password } = parsed.data

    // Find user
    const user = await prisma.user.findFirst({
      where: {
        OR: [
          email ? { email: email.toLowerCase() } : {},
          phone ? { phone } : {},
        ],
      },
    })

    if (!user || !user.password) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
    }

    if (user.status === 'BLOCKED') {
      return NextResponse.json({ error: 'Your account has been blocked. Please contact support.' }, { status: 403 })
    }

    const isValid = await comparePassword(password, user.password)
    if (!isValid) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
    }

    // Update last login
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    })

    const token = signToken({ userId: user.id, email: user.email, role: user.role })

    // Log if admin
    if (user.role !== 'CUSTOMER') {
      await logActivity({
        adminId: user.id,
        action: 'ADMIN_LOGIN',
        details: `Admin login: ${user.email || user.phone}`,
        ipAddress: req.headers.get('x-forwarded-for') || undefined,
      })
    }

    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        avatar: user.avatar,
      },
    })

    return setAuthCookie(response, token)
  } catch (err) {
    console.error('Login error:', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
