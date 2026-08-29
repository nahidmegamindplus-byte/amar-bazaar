import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { hashPassword, signToken, setAuthCookie } from '@/lib/auth'
import { sendTemplateEmail } from '@/lib/email'
import { createNotification } from '@/lib/notifications'
import { z } from 'zod'

const registerSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email().optional(),
  phone: z.string().min(11).max(15).optional(),
  password: z.string().min(8).max(100),
}).refine((d) => d.email || d.phone, { message: 'Email or phone required' })

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const parsed = registerSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: 'Validation error', details: parsed.error.flatten() }, { status: 400 })
    }

    const { name, email, phone, password } = parsed.data

    // Check existing
    if (email) {
      const exists = await prisma.user.findFirst({ where: { email: email.toLowerCase() } })
      if (exists) return NextResponse.json({ error: 'Email already registered' }, { status: 409 })
    }
    if (phone) {
      const exists = await prisma.user.findFirst({ where: { phone } })
      if (exists) return NextResponse.json({ error: 'Phone number already registered' }, { status: 409 })
    }

    const hashedPassword = await hashPassword(password)
    const user = await prisma.user.create({
      data: {
        name,
        email: email?.toLowerCase(),
        phone,
        password: hashedPassword,
        role: 'CUSTOMER',
        status: 'ACTIVE',
        wishlist: { create: {} },
        cart: { create: {} },
      },
    })

    // Send welcome email
    if (email) {
      await sendTemplateEmail('WELCOME', email, {
        name,
        shopUrl: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
      })
    }

    const token = signToken({ userId: user.id, email: user.email, role: user.role })

    const response = NextResponse.json({
      success: true,
      user: { id: user.id, name: user.name, email: user.email, phone: user.phone, role: user.role },
    }, { status: 201 })

    return setAuthCookie(response, token)
  } catch (err) {
    console.error('Register error:', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
