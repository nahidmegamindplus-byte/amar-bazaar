import { prisma } from '@/lib/prisma'
import ProductCard from '@/components/storefront/ProductCard'
import { Gift, Sparkles } from 'lucide-react'

export const metadata = {
  title: 'Combo Deals & Value Bundles',
  description: 'Save more with our organic grocery combo bundles and family packs.',
}

export default async function CombosPage() {
  const products = await prisma.product.findMany({
    where: { isPublished: true },
    orderBy: { soldCount: 'desc' },
    take: 8,
    include: {
      category: { select: { name: true, slug: true } },
      brand: { select: { name: true } },
    },
  })

  return (
    <div className="container py-8 space-y-8">
      <div className="bg-gradient-to-r from-emerald-700 to-slate-900 rounded-3xl p-8 text-white flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-lg">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-emerald-300 text-xs font-extrabold uppercase tracking-wider">
            <Gift size={18} />
            <span>Value Bundles</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold">Family Combo Packs 🎁</h1>
          <p className="text-emerald-100 text-xs md:text-sm font-light">Get complete organic grocery packages at bundled discount prices.</p>
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
