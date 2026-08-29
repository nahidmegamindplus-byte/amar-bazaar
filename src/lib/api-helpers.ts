import { NextResponse } from 'next/server'

export function successResponse(data: any, message?: string, status = 200) {
  return NextResponse.json({ success: true, message, data }, { status })
}

export function errorResponse(error: string, status = 400, details?: any) {
  return NextResponse.json({ success: false, error, details }, { status })
}

export function paginationMeta(total: number, page: number, limit: number) {
  return {
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
    hasNext: page * limit < total,
    hasPrev: page > 1,
  }
}

export function getPaginationParams(searchParams: URLSearchParams) {
  const page = Math.max(1, parseInt(searchParams.get('page') || '1'))
  const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '20')))
  const skip = (page - 1) * limit
  return { page, limit, skip }
}
