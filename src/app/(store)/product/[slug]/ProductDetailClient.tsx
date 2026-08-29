'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  Star, ShoppingCart, Heart, ShieldCheck, Truck, RotateCcw,
  CheckCircle2, Share2, Plus, Minus, Zap, ChevronRight
} from 'lucide-react'
import { formatPrice, calculateDiscount } from '@/lib/utils'
import ProductCard from '@/components/storefront/ProductCard'
import toast from 'react-hot-toast'

interface ProductDetailClientProps {
  product: any
  relatedProducts: any[]
}

export default function ProductDetailClient({ product, relatedProducts }: ProductDetailClientProps) {
  const router = useRouter()
  const [selectedVariant, setSelectedVariant] = useState<any>(
    product.variants?.find((v: any) => v.isDefault) || product.variants?.[0] || null
  )
  const [quantity, setQuantity] = useState(1)
  const [selectedImage, setSelectedImage] = useState(
    product.images?.[0]?.url || product.thumbnail || ''
  )
  const [adding, setAdding] = useState(false)
  const [buyingNow, setBuyingNow] = useState(false)
  const [activeTab, setActiveTab] = useState<'desc' | 'specs' | 'reviews'>('desc')

  // Pricing calculations
  const regularPrice = selectedVariant?.price || product.regularPrice
  const salePrice = selectedVariant?.salePrice || product.salePrice
  const price = salePrice || regularPrice
  const discount = calculateDiscount(regularPrice, salePrice || 0)
  const stock = selectedVariant?.stock !== undefined ? selectedVariant.stock : product.stock

  const handleAddToCart = async () => {
    if (stock <= 0) {
      toast.error('Item is out of stock')
      return
    }
    setAdding(true)
    try {
      const res = await fetch('/api/cart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: product.id,
          variantId: selectedVariant?.id || undefined,
          quantity,
        }),
      })
      const data = await res.json()
      if (res.ok && data.success) {
        toast.success(`Added ${quantity}x to cart!`)
      } else {
        toast.error(data.error || 'Failed to add to cart')
      }
    } catch {
      toast.error('Error adding to cart')
    } finally {
      setAdding(false)
    }
  }

  const handleBuyNow = async () => {
    if (stock <= 0) {
      toast.error('Item is out of stock')
      return
    }
    setBuyingNow(true)
    try {
      const res = await fetch('/api/cart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: product.id,
          variantId: selectedVariant?.id || undefined,
          quantity,
        }),
      })
      if (res.ok) {
        router.push('/checkout')
      } else {
        toast.error('Failed to initiate checkout')
      }
    } catch {
      toast.error('Error proceeding to checkout')
    } finally {
      setBuyingNow(false)
    }
  }

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({ title: product.name, url: window.location.href })
    } else {
      navigator.clipboard.writeText(window.location.href)
      toast.success('Link copied to clipboard!')
    }
  }

  return (
    <div className="container py-8 space-y-12">
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-2 text-xs text-slate-500">
        <Link href="/" className="hover:text-emerald-600">Home</Link>
        <ChevronRight size={12} />
        <Link href="/shop" className="hover:text-emerald-600">Shop</Link>
        {product.category && (
          <>
            <ChevronRight size={12} />
            <Link href={`/shop?category=${product.category.slug}`} className="hover:text-emerald-600">
              {product.category.name}
            </Link>
          </>
        )}
        <ChevronRight size={12} />
        <span className="text-slate-800 font-semibold line-clamp-1">{product.name}</span>
      </nav>

      {/* Main Product Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        {/* Left: Gallery */}
        <div className="lg:col-span-6 space-y-4">
          <div className="aspect-square rounded-3xl overflow-hidden bg-slate-50 border border-slate-100 shadow-xs relative">
            <img
              src={selectedImage || 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=800&q=80'}
              alt={product.name}
              className="w-full h-full object-cover"
            />
            {discount > 0 && (
              <span className="badge badge-red font-bold text-xs absolute top-4 left-4 shadow-sm">
                -{discount}% OFF
              </span>
            )}
            {product.isOrganic && (
              <span className="badge badge-green font-semibold text-xs absolute top-4 right-4 shadow-sm">
                🌿 100% Organic
              </span>
            )}
          </div>

          {/* Thumbnail Strip */}
          {product.images && product.images.length > 1 && (
            <div className="flex items-center gap-3 overflow-x-auto pb-2">
              {product.images.map((img: any) => (
                <button
                  key={img.id}
                  onClick={() => setSelectedImage(img.url)}
                  className={`w-20 h-20 rounded-xl overflow-hidden shrink-0 border-2 transition-all ${
                    selectedImage === img.url ? 'border-emerald-600 shadow-sm' : 'border-slate-200 opacity-70 hover:opacity-100'
                  }`}
                >
                  <img src={img.url} alt={img.alt || product.name} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right: Product Info & Actions */}
        <div className="lg:col-span-6 space-y-6">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full uppercase tracking-wider">
                {product.brand?.name || 'Pure Harvest'}
              </span>
              <button onClick={handleShare} className="p-2 text-slate-400 hover:text-slate-700 rounded-full hover:bg-slate-100 transition-colors">
                <Share2 size={16} />
              </button>
            </div>

            <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 leading-snug">
              {product.name}
            </h1>

            {/* Ratings & SKU */}
            <div className="flex flex-wrap items-center gap-4 text-xs pt-1">
              <div className="flex items-center gap-1 text-amber-500 font-bold">
                <Star size={15} fill="currentColor" />
                <span className="text-slate-800">{product.avgRating ? product.avgRating.toFixed(1) : '5.0'}</span>
                <span className="text-slate-400 font-normal">({product.reviewCount || 0} reviews)</span>
              </div>
              <span className="text-slate-300">|</span>
              <span className="text-slate-500">SKU: <strong className="text-slate-700">{product.sku || 'SB-ORG-001'}</strong></span>
              <span className="text-slate-300">|</span>
              <span className={stock > 0 ? 'text-emerald-600 font-semibold' : 'text-rose-600 font-semibold'}>
                {stock > 0 ? `In Stock (${stock} available)` : 'Out of Stock'}
              </span>
            </div>
          </div>

          {/* Pricing */}
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 flex items-baseline gap-3">
            <span className="text-3xl font-extrabold text-emerald-700">
              {formatPrice(price)}
            </span>
            {salePrice && salePrice < regularPrice && (
              <span className="text-base text-slate-400 line-through">
                {formatPrice(regularPrice)}
              </span>
            )}
            {discount > 0 && (
              <span className="badge badge-red font-bold text-xs">
                Save {discount}%
              </span>
            )}
          </div>

          {/* Variants selector */}
          {product.variants && product.variants.length > 0 && (
            <div className="space-y-2.5">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                Select Option / Package Size:
              </label>
              <div className="flex flex-wrap gap-2.5">
                {product.variants.map((v: any) => (
                  <button
                    key={v.id}
                    onClick={() => setSelectedVariant(v)}
                    className={`px-4 py-2 rounded-xl text-xs font-semibold border-2 transition-all flex items-center gap-1.5 ${
                      selectedVariant?.id === v.id
                        ? 'border-emerald-600 bg-emerald-50 text-emerald-800 shadow-xs'
                        : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                    }`}
                  >
                    <span>{v.name}</span>
                    <span className="text-slate-400 text-[11px]">({formatPrice(v.salePrice || v.price)})</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Quantity & Action CTAs */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center gap-4">
              <div className="inline-flex items-center border-2 border-slate-200 rounded-xl bg-white overflow-hidden">
                <button
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="px-3 py-2 text-slate-500 hover:bg-slate-100 transition-colors"
                >
                  <Minus size={14} />
                </button>
                <span className="w-10 text-center font-bold text-sm text-slate-800">{quantity}</span>
                <button
                  onClick={() => setQuantity((q) => Math.min(stock || 99, q + 1))}
                  className="px-3 py-2 text-slate-500 hover:bg-slate-100 transition-colors"
                >
                  <Plus size={14} />
                </button>
              </div>

              <span className="text-xs text-slate-500">
                Total: <strong className="text-slate-800 text-sm">{formatPrice(price * quantity)}</strong>
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <button
                onClick={handleAddToCart}
                disabled={adding || stock <= 0}
                className="btn btn-outline btn-lg rounded-xl font-bold text-sm flex items-center justify-center gap-2 border-emerald-600 text-emerald-700 hover:bg-emerald-50"
              >
                <ShoppingCart size={16} />
                <span>{adding ? 'Adding...' : 'Add to Cart'}</span>
              </button>

              <button
                onClick={handleBuyNow}
                disabled={buyingNow || stock <= 0}
                className="btn btn-primary btn-lg rounded-xl font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-700/20"
              >
                <Zap size={16} />
                <span>{buyingNow ? 'Processing...' : 'Buy Now (অর্ডার করুন)'}</span>
              </button>
            </div>
          </div>

          {/* Value delivery highlights */}
          <div className="grid grid-cols-3 gap-3 pt-4 border-t border-slate-100 text-center">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
              <Truck size={18} className="mx-auto text-emerald-600 mb-1" />
              <span className="text-[11px] font-bold text-slate-700 block">Fast Shipping</span>
              <span className="text-[10px] text-slate-500">Across Bangladesh</span>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
              <ShieldCheck size={18} className="mx-auto text-emerald-600 mb-1" />
              <span className="text-[11px] font-bold text-slate-700 block">100% Genuine</span>
              <span className="text-[10px] text-slate-500">Pure Organic</span>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
              <RotateCcw size={18} className="mx-auto text-emerald-600 mb-1" />
              <span className="text-[11px] font-bold text-slate-700 block">Easy Returns</span>
              <span className="text-[10px] text-slate-500">30-day guarantee</span>
            </div>
          </div>
        </div>
      </div>

      {/* Product Details Tabs (Description, Specifications, Customer Reviews) */}
      <div className="bg-white rounded-3xl border border-slate-100 p-6 md:p-8 shadow-xs">
        <div className="flex border-b border-slate-100 gap-6 mb-6">
          <button
            onClick={() => setActiveTab('desc')}
            className={`pb-3 text-sm font-bold border-b-2 transition-all ${
              activeTab === 'desc' ? 'border-emerald-600 text-emerald-700' : 'border-transparent text-slate-400 hover:text-slate-700'
            }`}
          >
            Product Description
          </button>
          <button
            onClick={() => setActiveTab('specs')}
            className={`pb-3 text-sm font-bold border-b-2 transition-all ${
              activeTab === 'specs' ? 'border-emerald-600 text-emerald-700' : 'border-transparent text-slate-400 hover:text-slate-700'
            }`}
          >
            Benefits & Usage
          </button>
          <button
            onClick={() => setActiveTab('reviews')}
            className={`pb-3 text-sm font-bold border-b-2 transition-all ${
              activeTab === 'reviews' ? 'border-emerald-600 text-emerald-700' : 'border-transparent text-slate-400 hover:text-slate-700'
            }`}
          >
            Reviews ({product.reviews?.length || 0})
          </button>
        </div>

        {activeTab === 'desc' && (
          <div className="prose prose-slate max-w-none text-slate-600 text-sm leading-relaxed space-y-4">
            <p>{product.description || product.shortDesc || 'Pure organic authentic product sourced with care.'}</p>
          </div>
        )}

        {activeTab === 'specs' && (
          <div className="space-y-3 text-xs md:text-sm text-slate-700">
            <div className="flex py-2 border-b border-slate-100">
              <span className="w-1/3 text-slate-400 font-semibold">Origin / Sourcing</span>
              <span className="w-2/3 font-medium">Bangladesh (Local Organic Cooperatives)</span>
            </div>
            <div className="flex py-2 border-b border-slate-100">
              <span className="w-1/3 text-slate-400 font-semibold">Storage Condition</span>
              <span className="w-2/3 font-medium">Store in a cool, dry place away from direct sunlight.</span>
            </div>
            <div className="flex py-2 border-b border-slate-100">
              <span className="w-1/3 text-slate-400 font-semibold">Quality Guarantee</span>
              <span className="w-2/3 font-medium">No artificial color, flavor, or chemical preservative added.</span>
            </div>
          </div>
        )}

        {activeTab === 'reviews' && (
          <div className="space-y-6">
            {product.reviews && product.reviews.length > 0 ? (
              <div className="space-y-4">
                {product.reviews.map((r: any) => (
                  <div key={r.id} className="p-4 bg-slate-50 rounded-2xl space-y-2 border border-slate-100">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-slate-800">{r.user?.name || 'Verified Customer'}</span>
                      <div className="flex text-amber-500">
                        {Array.from({ length: r.rating || 5 }).map((_, i) => (
                          <Star key={i} size={12} fill="currentColor" />
                        ))}
                      </div>
                    </div>
                    <p className="text-xs text-slate-600">{r.body || 'Excellent authentic quality. Will order again!'}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-400 text-center py-6">No customer reviews yet. Be the first to review!</p>
            )}
          </div>
        )}
      </div>

      {/* Related Products */}
      {relatedProducts && relatedProducts.length > 0 && (
        <div className="space-y-6 pt-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xl md:text-2xl font-extrabold text-slate-900">You May Also Like</h3>
            <Link href="/shop" className="text-xs font-bold text-emerald-600 hover:underline">View More</Link>
          </div>
          <div className="products-grid">
            {relatedProducts.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
