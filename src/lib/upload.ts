import { writeFile, mkdir } from 'fs/promises'
import { existsSync } from 'fs'
import path from 'path'
import { prisma } from './prisma'

export async function saveUploadedFile(
  file: File,
  folder: string = 'general',
  uploadedBy?: string
): Promise<{ url: string; media: any }> {
  const uploadDir = path.join(process.cwd(), 'public', 'uploads', folder)
  
  if (!existsSync(uploadDir)) {
    await mkdir(uploadDir, { recursive: true })
  }

  const bytes = await file.arrayBuffer()
  const buffer = Buffer.from(bytes)

  // Sanitize filename
  const ext = path.extname(file.name)
  const baseName = path.basename(file.name, ext).replace(/[^a-z0-9]/gi, '-').toLowerCase()
  const filename = `${baseName}-${Date.now()}${ext}`
  const filePath = path.join(uploadDir, filename)
  
  await writeFile(filePath, buffer)

  const url = `/uploads/${folder}/${filename}`

  // Save to media library
  const media = await prisma.media.create({
    data: {
      filename,
      originalName: file.name,
      url,
      size: file.size,
      mimeType: file.type,
      folder,
      uploadedBy,
    },
  })

  return { url, media }
}

export function isValidImageType(type: string): boolean {
  return ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml'].includes(type)
}

export function isValidFileSize(size: number, maxMb = 10): boolean {
  return size <= maxMb * 1024 * 1024
}
