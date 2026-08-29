import nodemailer from 'nodemailer'
import { prisma } from './prisma'

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
})

export async function sendEmail({ to, subject, html }: { to: string; subject: string; html: string }) {
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.log('[Email skipped - SMTP not configured]:', subject, 'to:', to)
    return
  }
  try {
    await transporter.sendMail({
      from: process.env.EMAIL_FROM || 'ShuddhoBazar <noreply@shuddhobazar.com>',
      to,
      subject,
      html,
    })
  } catch (err) {
    console.error('Email error:', err)
  }
}

export async function sendTemplateEmail(templateKey: string, to: string, variables: Record<string, string>) {
  try {
    const template = await prisma.emailTemplate.findUnique({ where: { key: templateKey } })
    if (!template || !template.isActive) return

    let subject = template.subject
    let body = template.body

    // Replace template variables
    for (const [key, value] of Object.entries(variables)) {
      subject = subject.replace(new RegExp(`{{${key}}}`, 'g'), value)
      body = body.replace(new RegExp(`{{${key}}}`, 'g'), value)
    }

    await sendEmail({ to, subject, html: body })
  } catch (err) {
    console.error('Template email error:', err)
  }
}

export async function sendOrderConfirmation(order: { orderNumber: string; shippingEmail?: string | null; shippingName: string; total: number }) {
  if (!order.shippingEmail) return
  await sendTemplateEmail('ORDER_CONFIRMATION', order.shippingEmail, {
    orderNumber: order.orderNumber,
    customerName: order.shippingName,
    total: order.total.toLocaleString(),
    trackingUrl: `${process.env.NEXT_PUBLIC_APP_URL}/track-order?order=${order.orderNumber}`,
  })
}
