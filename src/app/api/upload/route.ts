import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth'
import { saveUploadedFile, isValidImageType, isValidFileSize } from '@/lib/upload'

export async function POST(req: NextRequest) {
  const { error, session } = await requireAdmin(req)
  if (error) return error

  try {
    const formData = await req.formData()
    const file = formData.get('file') as File
    const folder = formData.get('folder') as string || 'general'

    if (!file) return NextResponse.json({ error: 'No file uploaded' }, { status: 400 })
    if (!isValidImageType(file.type)) return NextResponse.json({ error: 'Invalid file type. Allowed: JPEG, PNG, WebP, GIF, SVG' }, { status: 400 })
    if (!isValidFileSize(file.size, 10)) return NextResponse.json({ error: 'File too large. Max 10MB.' }, { status: 400 })

    const { url, media } = await saveUploadedFile(file, folder, session!.userId)

    return NextResponse.json({ success: true, data: { url, media } })
  } catch (err) {
    console.error('Upload error:', err)
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 })
  }
}
