import { prisma } from '@/lib/prisma'
import ShopClient from './ShopClient'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function ShopPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const resolvedParams = await searchParams
  
  const [categories, brands] = await Promise.all([
    prisma.category.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: 'asc' },
      include: { subcategories: { where: { isActive: true } }, _count: { select: { products: { where: { isPublished: true } } } } },
    }),
    prisma.brand.findMany({
      where: { isActive: true },
      include: { _count: { select: { products: { where: { isPublished: true } } } } },
    }),
  ])

  return <ShopClient initialCategories={categories} initialBrands={brands} initialParams={resolvedParams} />
}
