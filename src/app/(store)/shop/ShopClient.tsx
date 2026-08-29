'use client'
import { useState, useEffect, useCallback } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import ProductCard from '@/components/storefront/ProductCard'
import { Filter, SlidersHorizontal, ArrowUpDown, RefreshCw, X, Check } from 'lucide-react'

interface ShopClientProps {
  initialCategories: any[]
  initialBrands: any[]
  initialParams: any
}

export default function ShopClient({ initialCategories, initialBrands, initialParams }: ShopClientProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [products, setProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [pagination, setPagination] = useState<any>(null)
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false)

  // Filters State
  const [selectedCategory, setSelectedCategory] = useState<string>(
    typeof initialParams.category === 'string' ? initialParams.category : ''
  )
  const [selectedBrand, setSelectedBrand] = useState<string>(
    typeof initialParams.brand === 'string' ? initialParams.brand : ''
  )
  const [sort, setSort] = useState<string>(
    typeof initialParams.sort === 'string' ? initialParams.sort : 'newest'
  )
  const [inStockOnly, setInStockOnly] = useState<boolean>(initialParams.inStock === 'true')
  const [isOrganic, setIsOrganic] = useState<boolean>(initialParams.organic === 'true')
  const [page, setPage] = useState<number>(1)

  const fetchProducts = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (selectedCategory) params.set('category', selectedCategory)
      if (selectedBrand) params.set('brand', selectedBrand)
      if (sort) params.set('sort', sort)
      if (inStockOnly) params.set('inStock', 'true')
      if (isOrganic) params.set('organic', 'true')
      if (initialParams.newArrival === 'true') params.set('newArrival', 'true')
      if (initialParams.bestSelling === 'true') params.set('bestSelling', 'true')
      if (initialParams.flashSale === 'true') params.set('flashSale', 'true')
      params.set('page', String(page))
      params.set('limit', '12')

      const res = await fetch(`/api/products?${params.toString()}`)
      const json = await res.json()
      if (json.success) {
        setProducts(json.data)
        setPagination(json.pagination)
      }
    } catch {
      console.error('Error fetching shop products')
    } finally {
      setLoading(false)
    }
  }, [selectedCategory, selectedBrand, sort, inStockOnly, isOrganic, page, initialParams])

  useEffect(() => {
    fetchProducts()
  }, [fetchProducts])

  const resetFilters = () => {
    setSelectedCategory('')
    setSelectedBrand('')
    setInStockOnly(false)
    setIsOrganic(false)
    setSort('newest')
    setPage(1)
  }

  return (
    <div className="container py-8">
      {/* Breadcrumb / Title Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900">
            {selectedCategory
              ? initialCategories.find((c) => c.slug === selectedCategory)?.name || 'Organic Shop'
              : 'All Organic Products'}
          </h1>
          <p className="text-slate-500 text-xs md:text-sm mt-1">
            {pagination ? `Showing ${pagination.total} natural products` : 'Browse farm-fresh organic grocery'}
          </p>
        </div>

        {/* Top Controls */}
        <div className="flex items-center gap-3">
          {/* Mobile Filter Toggle */}
          <button
            onClick={() => setMobileFilterOpen(true)}
            className="md:hidden btn btn-outline btn-sm rounded-xl flex items-center gap-1.5"
          >
            <SlidersHorizontal size={14} />
            <span>Filters</span>
          </button>

          {/* Sort selector */}
          <div className="flex items-center gap-2 text-xs text-slate-600">
            <ArrowUpDown size={14} />
            <select
              value={sort}
              onChange={(e) => {
                setSort(e.target.value)
                setPage(1)
              }}
              className="select py-1.5 px-3 text-xs rounded-xl bg-white border-slate-200"
            >
              <option value="newest">Newest First</option>
              <option value="best_selling">Best Selling</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="top_rated">Top Rated</option>
            </select>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-8 items-start">
        {/* DESKTOP SIDEBAR FILTERS */}
        <aside className="hidden md:block space-y-6 bg-white p-5 rounded-2xl border border-slate-100 shadow-xs sticky top-24">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <span className="font-bold text-sm text-slate-800 flex items-center gap-2">
              <Filter size={15} /> Filters
            </span>
            {(selectedCategory || selectedBrand || inStockOnly || isOrganic) && (
              <button
                onClick={resetFilters}
                className="text-xs text-rose-500 hover:underline font-semibold"
              >
                Clear all
              </button>
            )}
          </div>

          {/* Categories Filter */}
          <div>
            <h4 className="font-bold text-xs uppercase tracking-wider text-slate-700 mb-3">Categories</h4>
            <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
              <button
                onClick={() => {
                  setSelectedCategory('')
                  setPage(1)
                }}
                className={`w-full text-left text-xs py-1.5 px-2.5 rounded-lg flex items-center justify-between transition-colors ${
                  selectedCategory === ''
                    ? 'bg-emerald-50 text-emerald-700 font-bold'
                    : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                <span>All Categories</span>
              </button>
              {initialCategories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => {
                    setSelectedCategory(cat.slug)
                    setPage(1)
                  }}
                  className={`w-full text-left text-xs py-1.5 px-2.5 rounded-lg flex items-center justify-between transition-colors ${
                    selectedCategory === cat.slug
                      ? 'bg-emerald-50 text-emerald-700 font-bold'
                      : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <span className="line-clamp-1">{cat.name}</span>
                  <span className="text-[10px] text-slate-400">({cat._count?.products || 0})</span>
                </button>
              ))}
            </div>
          </div>

          {/* Brands Filter */}
          {initialBrands.length > 0 && (
            <div className="pt-3 border-t border-slate-100">
              <h4 className="font-bold text-xs uppercase tracking-wider text-slate-700 mb-3">Brands</h4>
              <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                {initialBrands.map((b) => (
                  <button
                    key={b.id}
                    onClick={() => {
                      setSelectedBrand(selectedBrand === b.slug ? '' : b.slug)
                      setPage(1)
                    }}
                    className={`w-full text-left text-xs py-1.5 px-2.5 rounded-lg flex items-center justify-between transition-colors ${
                      selectedBrand === b.slug
                        ? 'bg-emerald-50 text-emerald-700 font-bold'
                        : 'text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <span>{b.name}</span>
                    <span className="text-[10px] text-slate-400">({b._count?.products || 0})</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Quick Toggles */}
          <div className="pt-3 border-t border-slate-100 space-y-2.5">
            <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-700 font-medium">
              <input
                type="checkbox"
                checked={inStockOnly}
                onChange={(e) => {
                  setInStockOnly(e.target.checked)
                  setPage(1)
                }}
                className="rounded text-emerald-600 focus:ring-emerald-500"
              />
              <span>In Stock Only</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-700 font-medium">
              <input
                type="checkbox"
                checked={isOrganic}
                onChange={(e) => {
                  setIsOrganic(e.target.checked)
                  setPage(1)
                }}
                className="rounded text-emerald-600 focus:ring-emerald-500"
              />
              <span>100% Certified Organic</span>
            </label>
          </div>
        </aside>

        {/* PRODUCTS GRID */}
        <main className="md:col-span-3 space-y-6">
          {loading ? (
            <div className="min-h-[350px] flex flex-col items-center justify-center gap-3 text-slate-400">
              <RefreshCw size={28} className="animate-spin text-emerald-600" />
              <p className="text-xs">Fetching natural products...</p>
            </div>
          ) : products.length === 0 ? (
            <div className="card p-12 text-center flex flex-col items-center justify-center">
              <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mb-3">
                <Filter size={24} />
              </div>
              <h3 className="text-base font-bold text-slate-800">No products found</h3>
              <p className="text-xs text-slate-500 max-w-sm mt-1 mb-4">
                No matching organic items with the current filter selection. Try changing your filters.
              </p>
              <button onClick={resetFilters} className="btn btn-primary btn-sm rounded-xl">
                Reset Filters
              </button>
            </div>
          ) : (
            <>
              <div className="products-grid">
                {products.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>

              {/* Pagination */}
              {pagination && pagination.totalPages > 1 && (
                <div className="flex items-center justify-between pt-6 border-t border-slate-200">
                  <span className="text-xs text-slate-500">
                    Page {pagination.page} of {pagination.totalPages}
                  </span>
                  <div className="flex gap-2">
                    <button
                      disabled={!pagination.hasPrev}
                      onClick={() => setPage((p) => p - 1)}
                      className="btn btn-outline btn-sm rounded-xl disabled:opacity-40"
                    >
                      Previous
                    </button>
                    <button
                      disabled={!pagination.hasNext}
                      onClick={() => setPage((p) => p + 1)}
                      className="btn btn-outline btn-sm rounded-xl disabled:opacity-40"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </main>
      </div>

      {/* MOBILE DRAWER FILTER */}
      {mobileFilterOpen && (
        <div className="fixed inset-0 z-50 flex">
          <div
            onClick={() => setMobileFilterOpen(false)}
            className="fixed inset-0 bg-black/40 backdrop-blur-xs"
          />
          <div className="relative ml-auto w-4/5 max-w-xs bg-white h-full p-6 overflow-y-auto space-y-6 shadow-2xl z-10">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <span className="font-bold text-sm text-slate-800">Filters</span>
              <button
                onClick={() => setMobileFilterOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-700"
              >
                <X size={18} />
              </button>
            </div>

            {/* Mobile Categories */}
            <div>
              <h4 className="font-bold text-xs uppercase text-slate-700 mb-2">Categories</h4>
              <div className="space-y-1">
                <button
                  onClick={() => {
                    setSelectedCategory('')
                    setMobileFilterOpen(false)
                    setPage(1)
                  }}
                  className={`w-full text-left text-xs py-1.5 px-2 rounded-md ${
                    selectedCategory === '' ? 'bg-emerald-50 text-emerald-700 font-bold' : 'text-slate-600'
                  }`}
                >
                  All Categories
                </button>
                {initialCategories.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => {
                      setSelectedCategory(c.slug)
                      setMobileFilterOpen(false)
                      setPage(1)
                    }}
                    className={`w-full text-left text-xs py-1.5 px-2 rounded-md ${
                      selectedCategory === c.slug ? 'bg-emerald-50 text-emerald-700 font-bold' : 'text-slate-600'
                    }`}
                  >
                    {c.name}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={() => setMobileFilterOpen(false)}
              className="btn btn-primary w-full btn-sm rounded-xl font-bold"
            >
              Apply Filters
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
