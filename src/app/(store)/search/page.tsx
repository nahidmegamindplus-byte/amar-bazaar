import { prisma } from '@/lib/prisma'
import ProductCard from '@/components/storefront/ProductCard'
import { Search } from 'lucide-react'

export const metadata = {
  title: 'Search Results',
  description: 'Search results for organic products at ShuddhoBazar.',
}

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>
}) {
  const { q } = await searchParams
  const query = q?.trim() || ''

  const products = query
    ? await prisma.product.findMany({
        where: {
          isPublished: true,
          OR: [
            { name: { contains: query } },
            { description: { contains: query } },
            { shortDesc: { contains: query } },
            { sku: { contains: query } },
            { tags: { contains: query } },
          ],
        },
        include: {
          category: { select: { name: true, slug: true } },
          brand: { select: { name: true } },
        },
      })
    : []

  return (
    <div className="container py-8 space-y-8">
      <div>
        <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
          <Search size={14} />
          <span>Search Results</span>
        </div>
        <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900">
          {query ? `Results for "${query}"` : 'Search Products'}
        </h1>
        <p className="text-slate-500 text-xs md:text-sm mt-1">
          Found {products.length} matching organic items
        </p>
      </div>

      {products.length === 0 ? (
        <div className="p-12 bg-white rounded-3xl border border-slate-100 text-center max-w-md mx-auto space-y-3">
          <Search size={36} className="mx-auto text-slate-300" />
          <h3 className="font-bold text-sm text-slate-800">No matching products found</h3>
          <p className="text-xs text-slate-500">Try searching for generic terms like "honey", "mustard", "oil", or "dates".</p>
        </div>
      ) : (
        <div className="products-grid">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  )
}
