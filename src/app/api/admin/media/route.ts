import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/auth'
import { unlink } from 'fs/promises'
import { existsSync } from 'fs'
import path from 'path'

export async function GET(req: NextRequest) {
  const { error } = await requireAdmin(req)
  if (error) return error

  try {
    const { searchParams } = new URL(req.url)
    const folder = searchParams.get('folder')
    const search = searchParams.get('search')
    const limit = parseInt(searchParams.get('limit') || '50')

    const where: any = {}
    if (folder) where.folder = folder
    if (search) {
      where.OR = [
        { originalName: { contains: search } },
        { filename: { contains: search } },
        { alt: { contains: search } },
      ]
    }

    let mediaList = await prisma.media.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: limit,
    })

    // If database has no media records yet, return sample default media
    if (mediaList.length === 0 && !search && !folder) {
      mediaList = [
        {
          id: 'med-1',
          filename: 'sundarban-honey.jpg',
          originalName: 'Raw Sundarban Honey',
          url: 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?auto=format&fit=crop&w=600&q=80',
          size: 145000,
          mimeType: 'image/jpeg',
          folder: 'products',
          createdAt: new Date(),
        },
        {
          id: 'med-2',
          filename: 'mustard-oil.jpg',
          originalName: 'Cold Pressed Mustard Oil',
          url: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&w=600&q=80',
          size: 192000,
          mimeType: 'image/jpeg',
          folder: 'products',
          createdAt: new Date(),
        },
        {
          id: 'med-3',
          filename: 'organic-ghee.jpg',
          originalName: 'Pabna Desi Cow Ghee',
          url: 'https://images.unsplash.com/photo-1628088062854-d1870b4553da?auto=format&fit=crop&w=600&q=80',
          size: 215000,
          mimeType: 'image/jpeg',
          folder: 'products',
          createdAt: new Date(),
        },
        {
          id: 'med-4',
          filename: 'ajwa-dates.jpg',
          originalName: 'Al-Madinah Ajwa Dates',
          url: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&w=600&q=80',
          size: 178000,
          mimeType: 'image/jpeg',
          folder: 'products',
          createdAt: new Date(),
        },
        {
          id: 'med-5',
          filename: 'chia-seeds.jpg',
          originalName: 'Organic Superfood Chia Seeds',
          url: 'https://images.unsplash.com/photo-1508746829417-e6f548d8d6ed?auto=format&fit=crop&w=600&q=80',
          size: 165000,
          mimeType: 'image/jpeg',
          folder: 'products',
          createdAt: new Date(),
        },
        {
          id: 'med-6',
          filename: 'hero-banner.jpg',
          originalName: 'Pure Organic Farm Banner',
          url: 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=1600&q=80',
          size: 450000,
          mimeType: 'image/jpeg',
          folder: 'banners',
          createdAt: new Date(),
        },
      ] as any[]
    }

    return NextResponse.json({ success: true, data: mediaList })
  } catch (err) {
    console.error('Media fetch error:', err)
    return NextResponse.json({ error: 'Failed to fetch media' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  const { error } = await requireAdmin(req)
  if (error) return error

  try {
    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')
    if (!id) return NextResponse.json({ error: 'Media ID required' }, { status: 400 })

    const media = await prisma.media.findUnique({ where: { id } })
    if (media) {
      // Delete file from disk if local
      if (media.url.startsWith('/uploads/')) {
        const filePath = path.join(process.cwd(), 'public', media.url)
        if (existsSync(filePath)) {
          await unlink(filePath).catch(() => {})
        }
      }
      await prisma.media.delete({ where: { id } })
    }

    return NextResponse.json({ success: true, message: 'Media deleted' })
  } catch (err) {
    console.error('Media delete error:', err)
    return NextResponse.json({ error: 'Failed to delete media' }, { status: 500 })
  }
}
