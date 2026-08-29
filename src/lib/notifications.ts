import { prisma } from './prisma'
import { NotificationType } from '@prisma/client'

export async function createNotification({
  userId,
  type,
  title,
  message,
  link,
  data,
}: {
  userId?: string
  type: NotificationType
  title: string
  message: string
  link?: string
  data?: Record<string, any>
}) {
  try {
    await prisma.notification.create({
      data: {
        userId,
        type,
        title,
        message,
        link,
        data: data ? JSON.stringify(data) : undefined,
      },
    })
  } catch (err) {
    console.error('Failed to create notification:', err)
  }
}

export async function createAdminNotification(type: NotificationType, title: string, message: string, link?: string, data?: Record<string, any>) {
  // Create notification for all admins
  try {
    const admins = await prisma.user.findMany({
      where: { role: { in: ['SUPER_ADMIN', 'ADMIN', 'MANAGER'] } },
      select: { id: true },
    })
    await Promise.all(
      admins.map((admin) =>
        createNotification({ userId: admin.id, type, title, message, link, data })
      )
    )
  } catch (err) {
    console.error('Failed to create admin notifications:', err)
  }
}

export async function logActivity({
  adminId,
  action,
  target,
  targetId,
  details,
  ipAddress,
}: {
  adminId?: string
  action: string
  target?: string
  targetId?: string
  details?: string
  ipAddress?: string
}) {
  try {
    await prisma.activityLog.create({
      data: { adminId, action, target, targetId, details, ipAddress },
    })
  } catch (err) {
    console.error('Failed to log activity:', err)
  }
}
