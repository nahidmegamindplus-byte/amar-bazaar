'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Heart, ShoppingBag, ArrowRight } from 'lucide-react'
import ProductCard from '@/components/storefront/ProductCard'

export default function WishlistPage() {
  const [products, setProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Load some featured products as wishlist items
    fetch('/api/products?featured=true&limit=6')
      .then((r) => r.json())
      .then((data) => {
        if (data.success) setProducts(data.data.slice(0, 3))
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="container py-8 space-y-8">
      <div>
        <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900">My Wishlist</h1>
        <p className="text-slate-500 text-xs md:text-sm mt-1">Saved organic products for future purchase</p>
      </div>

      {loading ? (
        <div className="py-16 text-center text-slate-400">Loading wishlist items...</div>
      ) : products.length === 0 ? (
        <div className="p-12 bg-white rounded-3xl border border-slate-100 text-center max-w-md mx-auto space-y-3">
          <Heart size={36} className="mx-auto text-slate-300" />
          <h3 className="font-bold text-sm text-slate-800">Your Wishlist is Empty</h3>
          <p className="text-xs text-slate-500">Save items you love by clicking the heart icon on any product.</p>
          <Link href="/shop" className="btn btn-primary btn-sm rounded-xl font-bold">
            Browse Shop
          </Link>
        </div>
      ) : (
        <div className="products-grid">
          {products.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
    </div>
  )
}
