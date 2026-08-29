import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/auth'

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error } = await requireAdmin(req)
  if (error) return error

  try {
    const { id } = await params
    const body = await req.json()
    const { status, adminNote } = body

    const updateData: any = {}
    if (status !== undefined) updateData.status = status
    if (adminNote !== undefined) updateData.adminNote = adminNote

    const updated = await prisma.incompleteOrder.update({
      where: { id },
      data: updateData,
    })

    return NextResponse.json({ success: true, data: updated })
  } catch (err: any) {
    console.error('Error updating incomplete order:', err)
    return NextResponse.json({ success: false, error: 'Failed to update incomplete order' }, { status: 500 })
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error } = await requireAdmin(req)
  if (error) return error

  try {
    const { id } = await params
    await prisma.incompleteOrder.delete({
      where: { id },
    })

    return NextResponse.json({ success: true, message: 'Deleted successfully' })
  } catch (err: any) {
    console.error('Error deleting incomplete order:', err)
    return NextResponse.json({ success: false, error: 'Failed to delete incomplete order' }, { status: 500 })
  }
}
