'use client'
import { useState } from 'react'
import Link from 'next/link'
import { ShoppingCart, Heart, Star, Check, Zap } from 'lucide-react'
import { formatPrice, calculateDiscount } from '@/lib/utils'
import toast from 'react-hot-toast'

interface ProductCardProps {
  product: {
    id: string
    name: string
    slug: string
    thumbnail?: string | null
    regularPrice: number
    salePrice?: number | null
    stock: number
    unit?: string | null
    avgRating?: number
    reviewCount?: number
    isOrganic?: boolean
    isFreeDelivery?: boolean
    isFlashSale?: boolean
    isNewArrival?: boolean
    isBestSelling?: boolean
    brand?: { name: string } | null
    category?: { name: string; slug: string } | null
  }
  onAddToCart?: () => void
}

export default function ProductCard({ product, onAddToCart }: ProductCardProps) {
  const [adding, setAdding] = useState(false)
  const [inWishlist, setInWishlist] = useState(false)

  const discount = calculateDiscount(product.regularPrice, product.salePrice || 0)
  const price = product.salePrice || product.regularPrice

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (product.stock <= 0) {
      toast.error('Item is currently out of stock')
      return
    }
    setAdding(true)
    try {
      const res = await fetch('/api/cart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId: product.id, quantity: 1 }),
      })
      const data = await res.json()
      if (res.ok && data.success) {
        toast.success(`Added "${product.name.slice(0, 20)}..." to cart!`)
        if (onAddToCart) onAddToCart()
      } else {
        toast.error(data.error || 'Could not add to cart')
      }
    } catch {
      toast.error('Failed to add product to cart')
    } finally {
      setAdding(false)
    }
  }

  const handleToggleWishlist = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setInWishlist(!inWishlist)
    toast.success(inWishlist ? 'Removed from wishlist' : 'Added to wishlist ❤️')
  }

  return (
    <div className="product-card group flex flex-col justify-between h-full bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden">
      <div>
        {/* Image & Badges */}
        <div className="product-image-wrapper relative aspect-square bg-slate-50 overflow-hidden">
          <Link href={`/product/${product.slug}`} className="block w-full h-full">
            <img
              src={product.thumbnail || 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=600&q=80'}
              alt={product.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              loading="lazy"
            />
          </Link>

          {/* Badges Container */}
          <div className="absolute top-2.5 left-2.5 flex flex-col gap-1.5 z-10 pointer-events-none">
            {discount > 0 && (
              <span className="badge badge-red font-bold text-xs shadow-sm">
                -{discount}% OFF
              </span>
            )}
            {product.isOrganic && (
              <span className="badge badge-green font-semibold text-[11px] shadow-sm">
                🌿 Organic
              </span>
            )}
            {product.isFlashSale && (
              <span className="badge badge-orange font-semibold text-[11px] shadow-sm flex items-center gap-0.5">
                <Zap size={10} /> Flash
              </span>
            )}
          </div>

          {/* Quick Action Buttons */}
          <div className="product-actions absolute top-2.5 right-2.5 flex flex-col gap-1.5 z-10">
            <button
              onClick={handleToggleWishlist}
              aria-label="Add to wishlist"
              className={`action-btn ${inWishlist ? 'bg-rose-50 text-rose-500 border-rose-200' : ''}`}
            >
              <Heart size={15} fill={inWishlist ? '#f43f5e' : 'none'} color={inWishlist ? '#f43f5e' : 'currentColor'} />
            </button>
          </div>

          {/* Stock Overlay if Out of Stock */}
          {product.stock <= 0 && (
            <div className="absolute inset-0 bg-white/80 backdrop-blur-xs flex items-center justify-center">
              <span className="bg-rose-600 text-white text-xs font-bold px-3 py-1.5 rounded-full uppercase tracking-wider shadow">
                Out of Stock
              </span>
            </div>
          )}
        </div>

        {/* Content Details */}
        <div className="p-3.5 flex flex-col gap-1">
          {/* Category / Brand */}
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>{product.category?.name || product.brand?.name || 'Organic'}</span>
            {product.unit && <span className="text-[11px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded">{product.unit}</span>}
          </div>

          {/* Title */}
          <Link href={`/product/${product.slug}`} className="text-slate-800 font-semibold text-sm line-clamp-2 hover:text-emerald-600 transition-colors mt-0.5 min-h-[2.5rem]">
            {product.name}
          </Link>

          {/* Rating */}
          <div className="flex items-center gap-1.5 text-xs text-amber-500 mt-1">
            <div className="flex items-center">
              <Star size={13} fill="currentColor" />
            </div>
            <span className="font-bold text-slate-700 text-xs">{product.avgRating ? product.avgRating.toFixed(1) : '5.0'}</span>
            <span className="text-slate-400 text-[11px]">({product.reviewCount || 12})</span>
          </div>
        </div>
      </div>

      {/* Pricing & Add to Cart footer */}
      <div className="p-3.5 pt-0 mt-auto">
        <div className="flex items-baseline gap-2 mb-2.5">
          <span className="text-emerald-700 font-extrabold text-base">
            {formatPrice(price)}
          </span>
          {product.salePrice && product.salePrice < product.regularPrice && (
            <span className="text-slate-400 text-xs line-through">
              {formatPrice(product.regularPrice)}
            </span>
          )}
        </div>

        <button
          onClick={handleAddToCart}
          disabled={adding || product.stock <= 0}
          className="btn btn-primary w-full text-xs font-bold py-2 rounded-xl flex items-center justify-center gap-1.5 shadow-sm active:scale-95 transition-all"
        >
          {adding ? (
            <span className="inline-block animate-spin text-sm">⏳</span>
          ) : product.stock <= 0 ? (
            'Unavailable'
          ) : (
            <>
              <ShoppingCart size={14} />
              <span>Add To Cart</span>
            </>
          )}
        </button>
      </div>
    </div>
  )
}
