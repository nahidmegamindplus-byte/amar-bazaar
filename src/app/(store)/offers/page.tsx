import { prisma } from '@/lib/prisma'
import { fallbackProducts } from '@/lib/fallback-data'
import ProductCard from '@/components/storefront/ProductCard'
import { Sparkles } from 'lucide-react'

export const metadata = {
  title: 'Special Offers & Discounts',
  description: 'Handpicked discounted organic products for health and taste.',
}

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function OffersPage() {
  let products: any[] = fallbackProducts.filter(p => p.isOffer || p.salePrice)

  try {
    const dbProducts = await prisma.product.findMany({
      where: { isPublished: true, salePrice: { not: null } },
      orderBy: { soldCount: 'desc' },
      include: {
        category: { select: { name: true, slug: true } },
        brand: { select: { name: true } },
      },
    })
    if (dbProducts?.length) products = dbProducts
  } catch {
    // Fallback safely
  }

  return (
    <div className="container py-8 space-y-8">
      <div>
        <div className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full uppercase tracking-wider mb-2">
          <Sparkles size={13} />
          <span>Save More</span>
        </div>
        <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900">Special Offers & Deals</h1>
        <p className="text-slate-500 text-xs md:text-sm mt-1">Authentic farm items with reduced promotional prices</p>
      </div>

      <div className="products-grid">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  )
}
