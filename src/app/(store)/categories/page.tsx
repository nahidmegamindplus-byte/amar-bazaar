import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { ChevronRight } from 'lucide-react'

export const metadata = {
  title: 'All Categories',
  description: 'Browse all organic product categories at ShuddhoBazar.',
}

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function CategoriesPage() {
  const categories = await prisma.category.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: 'asc' },
    include: {
      subcategories: { where: { isActive: true }, orderBy: { sortOrder: 'asc' } },
      _count: { select: { products: { where: { isPublished: true } } } },
    },
  })

  return (
    <div className="container py-8 space-y-8">
      <div>
        <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900">All Product Categories</h1>
        <p className="text-slate-500 text-xs md:text-sm mt-1">Explore our wide variety of pure and organic groceries</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories.map((cat) => (
          <div key={cat.id} className="bg-white rounded-3xl border border-slate-100 p-6 shadow-xs flex flex-col justify-between space-y-4 hover:shadow-md transition-shadow">
            <div>
              <div className="flex items-center gap-4 mb-4">
                <div className="w-16 h-16 rounded-2xl overflow-hidden bg-slate-50 shrink-0 border border-slate-100">
                  <img
                    src={cat.image || 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=300&q=80'}
                    alt={cat.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-slate-900 line-clamp-1">{cat.name}</h3>
                  <p className="text-xs text-slate-400 mt-0.5">{cat._count.products} products</p>
                </div>
              </div>

              {cat.subcategories && cat.subcategories.length > 0 && (
                <div className="space-y-1.5 pt-2 border-t border-slate-50">
                  {cat.subcategories.map((sub: any) => (
                    <Link
                      key={sub.id}
                      href={`/shop?category=${cat.slug}&subcategory=${sub.slug}`}
                      className="text-xs text-slate-600 hover:text-emerald-600 flex items-center justify-between py-1 transition-colors"
                    >
                      <span>{sub.name}</span>
                      <ChevronRight size={12} className="text-slate-400" />
                    </Link>
                  ))}
                </div>
              )}
            </div>

            <Link
              href={`/shop?category=${cat.slug}`}
              className="btn btn-outline btn-sm w-full rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 mt-2"
            >
              <span>Explore {cat.name.split(' ')[0]}</span>
              <ChevronRight size={14} />
            </Link>
          </div>
        ))}
      </div>
    </div>
  )
}
