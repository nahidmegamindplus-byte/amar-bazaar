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
        toast.success(`Added to cart!`, { duration: 1500 })
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
    toast.success(inWishlist ? 'Removed from wishlist' : 'Added to wishlist ❤️', { duration: 1500 })
  }

  return (
    <div className="product-card group flex flex-col justify-between bg-white rounded-xl border border-slate-100/90 shadow-[0_1px_3px_rgba(0,0,0,0.04)] hover:shadow-md hover:border-emerald-500/30 transition-all duration-200 overflow-hidden">
      <div>
        {/* Image & Badges */}
        <div className="product-image-wrapper relative aspect-square bg-slate-50/80 overflow-hidden">
          <Link href={`/product/${product.slug}`} className="block w-full h-full">
            <img
              src={product.thumbnail || 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=400&q=80'}
              alt={product.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              loading="lazy"
            />
          </Link>

          {/* Badges Container */}
          <div className="absolute top-1.5 left-1.5 flex flex-col gap-1 z-10 pointer-events-none">
            {discount > 0 && (
              <span className="badge badge-red font-bold text-[9px] px-1 py-0.2 shadow-xs">
                -{discount}%
              </span>
            )}
            {product.isOrganic && (
              <span className="badge badge-green font-semibold text-[9px] px-1 py-0.2 shadow-xs">
                🌿 Pure
              </span>
            )}
            {product.isFlashSale && (
              <span className="badge badge-orange font-semibold text-[9px] px-1 py-0.2 shadow-xs flex items-center gap-0.5">
                <Zap size={8} /> Flash
              </span>
            )}
          </div>

          {/* Quick Action Button */}
          <div className="product-actions absolute top-1.5 right-1.5 flex flex-col gap-1 z-10">
            <button
              onClick={handleToggleWishlist}
              aria-label="Add to wishlist"
              className={`w-6 h-6 rounded-full bg-white/95 backdrop-blur-xs border border-slate-200/80 flex items-center justify-center cursor-pointer shadow-xs transition-colors hover:bg-emerald-600 hover:text-white ${inWishlist ? 'bg-rose-50 text-rose-500 border-rose-200' : 'text-slate-500'}`}
            >
              <Heart size={11} fill={inWishlist ? '#f43f5e' : 'none'} color={inWishlist ? '#f43f5e' : 'currentColor'} />
            </button>
          </div>

          {/* Stock Overlay if Out of Stock */}
          {product.stock <= 0 && (
            <div className="absolute inset-0 bg-white/80 backdrop-blur-xs flex items-center justify-center">
              <span className="bg-rose-600 text-white text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider shadow-xs">
                Stock Out
              </span>
            </div>
          )}
        </div>

        {/* Content Details (Compact & Professional) */}
        <div className="p-2 pb-1 flex flex-col gap-0.5">
          {/* Category / Unit */}
          <div className="flex items-center justify-between text-[10px] text-slate-400">
            <span className="line-clamp-1 font-medium">{product.category?.name || product.brand?.name || 'Organic'}</span>
            {product.unit && <span className="text-[9px] bg-slate-100 text-slate-500 px-1 py-0.2 rounded font-mono">{product.unit}</span>}
          </div>

          {/* Title (Compact 2-line max or 1-line clean) */}
          <Link href={`/product/${product.slug}`} className="text-slate-800 font-medium text-[11.5px] leading-tight line-clamp-1 hover:text-emerald-700 transition-colors mt-0.5">
            {product.name}
          </Link>

          {/* Rating */}
          <div className="flex items-center gap-1 text-[10px] text-amber-500">
            <Star size={10} fill="currentColor" />
            <span className="font-bold text-slate-700 text-[10px]">{product.avgRating ? product.avgRating.toFixed(1) : '5.0'}</span>
            <span className="text-slate-400 text-[9px]">({product.reviewCount || 8})</span>
          </div>
        </div>
      </div>

      {/* Pricing & Compact Add to Cart Button */}
      <div className="p-2 pt-1 flex items-center justify-between gap-1.5 border-t border-slate-50">
        <div className="flex flex-col min-w-0">
          <span className="text-emerald-700 font-extrabold text-[13px] leading-none">
            {formatPrice(price)}
          </span>
          {product.salePrice && product.salePrice < product.regularPrice && (
            <span className="text-slate-400 text-[10px] line-through leading-tight">
              {formatPrice(product.regularPrice)}
            </span>
          )}
        </div>

        {/* Small & Sleek Add to Cart Button */}
        <button
          onClick={handleAddToCart}
          disabled={adding || product.stock <= 0}
          aria-label="Add to cart"
          className="btn btn-primary text-[10.5px] font-bold py-1 px-2.5 h-6.5 min-h-0 rounded-md flex items-center gap-1 shadow-xs active:scale-95 transition-all shrink-0 cursor-pointer"
        >
          {adding ? (
            <span className="inline-block animate-spin text-[10px]">⏳</span>
          ) : product.stock <= 0 ? (
            <span className="text-[9px]">Out</span>
          ) : (
            <>
              <ShoppingCart size={11} />
              <span>Add</span>
            </>
          )}
        </button>
      </div>
    </div>
  )
}
