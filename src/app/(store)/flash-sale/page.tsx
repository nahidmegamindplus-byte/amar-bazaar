import { prisma } from '@/lib/prisma'
import ProductCard from '@/components/storefront/ProductCard'
import { Zap } from 'lucide-react'

export const metadata = {
  title: 'Flash Sale',
  description: 'Limited-time discounts on pure and organic grocery items.',
}

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function FlashSalePage() {
  const products = await prisma.product.findMany({
    where: { isPublished: true, isFlashSale: true },
    orderBy: { createdAt: 'desc' },
    include: {
      category: { select: { name: true, slug: true } },
      brand: { select: { name: true } },
    },
  })

  return (
    <div className="container py-8 space-y-8">
      <div className="bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 rounded-3xl p-8 text-white flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-lg">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-amber-200 text-xs font-extrabold uppercase tracking-wider">
            <Zap size={18} />
            <span>Exclusive Deals</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold">Flash Sale Deals 🔥</h1>
          <p className="text-amber-100 text-xs md:text-sm font-light">Grab pure organic honey, oils, dates & superfoods at massive discounts.</p>
        </div>
      </div>

      <div className="products-grid">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  )
}
