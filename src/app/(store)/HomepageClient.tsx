'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  ShieldCheck, Truck, RotateCcw, Award, ChevronRight, Zap,
  Clock, ArrowRight, Star, Sparkles, CheckCircle2, HeartHandshake,
  Gift, Flame, Leaf, Package
} from 'lucide-react'
import ProductCard from '@/components/storefront/ProductCard'

interface HomepageClientProps {
  sections: any[]
  categories: any[]
  banners: any[]
  flashSaleProducts: any[]
  featuredProducts: any[]
  newProducts: any[]
  bestSellingProducts: any[]
  settings: any
}

export default function HomepageClient({
  sections,
  categories,
  banners,
  flashSaleProducts,
  featuredProducts,
  newProducts,
  bestSellingProducts,
  settings
}: HomepageClientProps) {
  const [timeLeft, setTimeLeft] = useState({ hours: 48, minutes: 30, seconds: 45 })

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 }
        if (prev.minutes > 0) return { ...prev, minutes: 59, seconds: 59 }
        if (prev.hours > 0) return { ...prev, hours: prev.hours - 1, minutes: 59, seconds: 59 }
        return prev
      })
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  return (
    <div className="space-y-6 md:space-y-8 pb-8">
      {/* 1. COMPACT LUXURY HERO SECTION */}
      <section className="relative bg-gradient-to-br from-emerald-950 via-emerald-900 to-slate-950 text-white overflow-hidden py-6 md:py-10 rounded-2xl md:rounded-3xl mx-2 md:mx-4 mt-2 shadow-lg border border-emerald-800/30">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#4ade80_1px,transparent_1px)] [background-size:14px_14px]" />
        
        <div className="container relative z-10 px-4 md:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
            {/* Left Content */}
            <div className="lg:col-span-7 space-y-3 text-center lg:text-left">
              <div className="inline-flex items-center gap-1.5 bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-[11px] font-bold px-3 py-1 rounded-full backdrop-blur-md">
                <Sparkles size={12} className="text-amber-400" />
                <span>100% Pure Organic • Farm Direct</span>
              </div>
              <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold tracking-tight leading-tight text-white">
                Authentic Taste, <br className="hidden sm:inline" />
                <span className="text-emerald-400">Pure Organic</span> Life.
              </h1>
              <p className="text-slate-200 text-xs md:text-sm max-w-lg mx-auto lg:mx-0 leading-relaxed font-light">
                Directly harvested from Sundarban deep forests & rural farmers. Raw honey, ghani wood-pressed oils & pure organic grocery across Bangladesh.
              </p>
              
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-2.5 pt-1">
                <Link
                  href="/shop"
                  className="btn btn-primary rounded-xl font-bold text-xs py-2 px-4 shadow-md hover:bg-emerald-500 transition-all flex items-center gap-1.5"
                >
                  <span>Shop Organic</span>
                  <ArrowRight size={14} />
                </Link>
                <Link
                  href="/shop?category=pure-honey"
                  className="btn bg-white/10 hover:bg-white/20 text-white border border-white/20 rounded-xl text-xs py-2 px-3.5 font-semibold backdrop-blur-xs"
                >
                  Pure Honey (মধু)
                </Link>
                <Link
                  href="/flash-sale"
                  className="btn bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-400/30 rounded-xl text-xs py-2 px-3.5 font-semibold flex items-center gap-1"
                >
                  <Zap size={13} />
                  <span>Flash Deals</span>
                </Link>
              </div>

              {/* Compact Trust badges */}
              <div className="grid grid-cols-3 gap-3 pt-3 border-t border-white/10 max-w-sm mx-auto lg:mx-0 text-center lg:text-left">
                <div>
                  <div className="text-base md:text-lg font-extrabold text-amber-400">100%</div>
                  <div className="text-[10px] text-slate-300">Natural & Raw</div>
                </div>
                <div>
                  <div className="text-base md:text-lg font-extrabold text-amber-400">64 Districts</div>
                  <div className="text-[10px] text-slate-300">Fast Delivery</div>
                </div>
                <div>
                  <div className="text-base md:text-lg font-extrabold text-amber-400">15k+</div>
                  <div className="text-[10px] text-slate-300">Happy Families</div>
                </div>
              </div>
            </div>

            {/* Right Hero Image Card */}
            <div className="lg:col-span-5 relative flex justify-center">
              <div className="relative w-full max-w-xs md:max-w-sm aspect-[4/3] rounded-2xl overflow-hidden shadow-xl border-2 border-white/10 group">
                <img
                  src={banners[0]?.image || "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=600&q=80"}
                  alt="Organic ShuddhoBazar"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex flex-col justify-end p-4">
                  <span className="text-amber-400 font-bold text-[10px] uppercase tracking-wider">Premium Selection</span>
                  <h3 className="text-white text-sm md:text-base font-bold">Sundarban Honey & Pabna Ghee</h3>
                  <p className="text-slate-300 text-[11px]">Lab-tested purity with traditional harvesting</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. COMPACT VALUE STRIP */}
      <section className="container">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
          <div className="card p-2.5 px-3 flex items-center gap-2.5 border-emerald-100/70 bg-emerald-50/30 rounded-xl">
            <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center shrink-0">
              <ShieldCheck size={16} />
            </div>
            <div className="min-w-0">
              <h4 className="font-bold text-slate-800 text-xs truncate">100% Pure</h4>
              <p className="text-slate-400 text-[10px] truncate">Lab-tested organic</p>
            </div>
          </div>

          <div className="card p-2.5 px-3 flex items-center gap-2.5 border-amber-100/70 bg-amber-50/30 rounded-xl">
            <div className="w-8 h-8 rounded-lg bg-amber-600 text-white flex items-center justify-center shrink-0">
              <Truck size={16} />
            </div>
            <div className="min-w-0">
              <h4 className="font-bold text-slate-800 text-xs truncate">Fast Delivery</h4>
              <p className="text-slate-400 text-[10px] truncate">All 64 districts</p>
            </div>
          </div>

          <div className="card p-2.5 px-3 flex items-center gap-2.5 border-blue-100/70 bg-blue-50/30 rounded-xl">
            <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center shrink-0">
              <HeartHandshake size={16} />
            </div>
            <div className="min-w-0">
              <h4 className="font-bold text-slate-800 text-xs truncate">Cash On Delivery</h4>
              <p className="text-slate-400 text-[10px] truncate">Pay after check</p>
            </div>
          </div>

          <div className="card p-2.5 px-3 flex items-center gap-2.5 border-purple-100/70 bg-purple-50/30 rounded-xl">
            <div className="w-8 h-8 rounded-lg bg-purple-600 text-white flex items-center justify-center shrink-0">
              <RotateCcw size={16} />
            </div>
            <div className="min-w-0">
              <h4 className="font-bold text-slate-800 text-xs truncate">Easy Returns</h4>
              <p className="text-slate-400 text-[10px] truncate">Guaranteed quality</p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. COMPACT CATEGORIES ROW */}
      <section className="container">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Leaf size={16} className="text-emerald-600" />
            <h2 className="text-sm md:text-base font-extrabold text-slate-900">Featured Categories</h2>
          </div>
          <Link href="/categories" className="text-emerald-700 font-bold text-xs flex items-center gap-0.5 hover:underline">
            <span>View All</span>
            <ChevronRight size={13} />
          </Link>
        </div>

        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 md:gap-3">
          {categories.slice(0, 6).map((cat) => (
            <Link
              key={cat.id}
              href={`/shop?category=${cat.slug}`}
              className="card group p-2 flex flex-col items-center text-center hover:border-emerald-500 hover:shadow-xs transition-all rounded-xl bg-white border border-slate-100"
            >
              <div className="w-12 h-12 md:w-14 md:h-14 rounded-xl overflow-hidden bg-slate-50 mb-1.5 group-hover:scale-105 transition-transform duration-200 border border-slate-100">
                <img
                  src={cat.image || 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=150&q=80'}
                  alt={cat.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <h3 className="font-bold text-[11px] md:text-xs text-slate-800 group-hover:text-emerald-700 transition-colors line-clamp-1">
                {cat.name.split(' ')[0]}
              </h3>
              <span className="text-[9.5px] text-slate-400">
                {cat._count?.products || 6}+ Items
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* 4. FLASH SALE COMPACT STRIP */}
      {flashSaleProducts.length > 0 && (
        <section className="container">
          <div className="bg-gradient-to-r from-amber-600 via-orange-600 to-rose-600 rounded-2xl p-4 md:p-5 text-white shadow-md">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3.5">
              <div className="flex items-center gap-2">
                <Flame size={20} className="text-amber-200 animate-pulse" />
                <div>
                  <h2 className="text-base md:text-lg font-extrabold text-white leading-tight">Flash Sale Live 🔥</h2>
                  <p className="text-amber-100 text-[11px]">Limited quantities at lowest direct prices</p>
                </div>
              </div>

              {/* Compact Countdown */}
              <div className="flex items-center gap-1.5 text-slate-900 font-extrabold self-start sm:self-auto">
                <div className="bg-white/95 px-2 py-1 rounded-lg text-center shadow-xs min-w-[36px]">
                  <div className="text-xs font-bold leading-none text-rose-600">{String(timeLeft.hours).padStart(2, '0')}</div>
                  <div className="text-[8px] text-slate-500 uppercase">H</div>
                </div>
                <span className="text-white text-xs font-bold">:</span>
                <div className="bg-white/95 px-2 py-1 rounded-lg text-center shadow-xs min-w-[36px]">
                  <div className="text-xs font-bold leading-none text-rose-600">{String(timeLeft.minutes).padStart(2, '0')}</div>
                  <div className="text-[8px] text-slate-500 uppercase">M</div>
                </div>
                <span className="text-white text-xs font-bold">:</span>
                <div className="bg-white/95 px-2 py-1 rounded-lg text-center shadow-xs min-w-[36px]">
                  <div className="text-xs font-bold leading-none text-rose-600">{String(timeLeft.seconds).padStart(2, '0')}</div>
                  <div className="text-[8px] text-slate-500 uppercase">S</div>
                </div>
              </div>
            </div>

            {/* Flash Sale Grid (4 items max for compactness) */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
              {flashSaleProducts.slice(0, 4).map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 5. TOP SELLING PRODUCTS */}
      <section className="container">
        <div className="flex items-center justify-between mb-3">
          <div>
            <span className="text-[10px] font-extrabold text-emerald-600 tracking-wider uppercase">Customer Favorites</span>
            <h2 className="text-sm md:text-base font-extrabold text-slate-900">Top Selling Products</h2>
          </div>
          <Link href="/shop?bestSelling=true" className="text-emerald-700 font-bold text-xs flex items-center gap-0.5 hover:underline">
            <span>View All</span>
            <ChevronRight size={13} />
          </Link>
        </div>

        <div className="products-grid">
          {(bestSellingProducts.length > 0 ? bestSellingProducts : featuredProducts).slice(0, 5).map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {/* 6. COMPACT LUXURY PROMO BANNER */}
      <section className="container">
        <div className="relative rounded-2xl overflow-hidden bg-slate-950 text-white min-h-[140px] md:min-h-[160px] flex items-center border border-slate-800">
          <img
            src="https://images.unsplash.com/photo-1587049352846-4a222e784d38?auto=format&fit=crop&w=1200&q=80"
            alt="Sundarban honey promo"
            className="absolute inset-0 w-full h-full object-cover opacity-30"
          />
          <div className="relative z-10 p-4 md:p-8 max-w-md space-y-1.5">
            <span className="badge badge-yellow font-bold uppercase text-[9.5px]">Pure Forest Harvest</span>
            <h3 className="text-base md:text-xl font-extrabold text-white leading-tight">
              Raw Sundarban Wild Honey (সুন্দরবনের মধু)
            </h3>
            <p className="text-slate-300 text-[11px] leading-relaxed line-clamp-2">
              Collected naturally by Mawals from mangrove forests. 100% Raw & unprocessed.
            </p>
            <Link href="/shop?category=pure-honey" className="btn btn-primary rounded-lg text-xs py-1.5 px-3 font-bold inline-flex items-center gap-1 mt-1">
              <span>Order Raw Honey</span>
              <ChevronRight size={12} />
            </Link>
          </div>
        </div>
      </section>

      {/* 7. NEW ARRIVALS */}
      <section className="container">
        <div className="flex items-center justify-between mb-3">
          <div>
            <span className="text-[10px] font-extrabold text-emerald-600 tracking-wider uppercase">Fresh Harvest</span>
            <h2 className="text-sm md:text-base font-extrabold text-slate-900">New Arrivals</h2>
          </div>
          <Link href="/shop?newArrival=true" className="text-emerald-700 font-bold text-xs flex items-center gap-0.5 hover:underline">
            <span>View All</span>
            <ChevronRight size={13} />
          </Link>
        </div>

        <div className="products-grid">
          {(newProducts.length > 0 ? newProducts : featuredProducts).slice(0, 5).map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {/* 8. COMPACT TRUST & WHY CHOOSE */}
      <section className="bg-emerald-50/50 py-6 border-y border-emerald-100/80">
        <div className="container space-y-4 text-center">
          <div>
            <span className="text-[10px] font-bold text-emerald-700 tracking-wider uppercase">Purity You Can Trust</span>
            <h2 className="text-base md:text-lg font-extrabold text-slate-900">The ShuddhoBazar Promise</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-left">
            <div className="card p-3.5 bg-white rounded-xl border-slate-100 space-y-1 shadow-xs">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-xs">1</span>
                <h4 className="font-bold text-slate-800 text-xs">Direct Farmer Sourcing</h4>
              </div>
              <p className="text-slate-500 text-[11px] leading-relaxed">
                We eliminate middlemen to ensure genuine quality and fair price directly from local cooperatives.
              </p>
            </div>

            <div className="card p-3.5 bg-white rounded-xl border-slate-100 space-y-1 shadow-xs">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-xs">2</span>
                <h4 className="font-bold text-slate-800 text-xs">Zero Chemical Guarantee</h4>
              </div>
              <p className="text-slate-500 text-[11px] leading-relaxed">
                No artificial colors, preservatives, or adulteration. 100% natural and authentic.
              </p>
            </div>

            <div className="card p-3.5 bg-white rounded-xl border-slate-100 space-y-1 shadow-xs">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-xs">3</span>
                <h4 className="font-bold text-slate-800 text-xs">Check & Pay Delivery</h4>
              </div>
              <p className="text-slate-500 text-[11px] leading-relaxed">
                Check package upon arrival with Cash on Delivery across all 64 districts in Bangladesh.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
