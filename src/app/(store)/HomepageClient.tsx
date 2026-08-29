'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  ShieldCheck, Truck, RotateCcw, Award, ChevronRight, Zap,
  Clock, ArrowRight, Star, Sparkles, CheckCircle2, HeartHandshake
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
  // Flash sale countdown state (mocking 2 days 14 hours 30 mins)
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
    <div className="space-y-12 pb-16">
      {/* 1. HERO SECTION & BANNER */}
      <section className="relative bg-gradient-to-br from-emerald-900 via-emerald-800 to-slate-900 text-white overflow-hidden py-12 md:py-20">
        <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#4ade80_1px,transparent_1px)] [background-size:16px_16px]" />
        
        <div className="container relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Left Content */}
            <div className="lg:col-span-7 space-y-5 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-xs font-bold px-3.5 py-1.5 rounded-full backdrop-blur-md">
                <Sparkles size={14} className="text-amber-400" />
                <span>100% Pure & Organic Certified</span>
              </div>
              <h1 className="text-3xl md:text-5xl lg:text-6xl font-extrabold tracking-tight leading-tight text-white">
                Authentic Taste, <br />
                <span className="text-emerald-400">Pure Organic</span> Life.
              </h1>
              <p className="text-slate-200 text-sm md:text-base max-w-xl mx-auto lg:mx-0 leading-relaxed font-light">
                Directly sourced from Sundarban deep forests & rural Bangladeshi farmers. Zero chemicals, unfiltered honey, wood-pressed pure oils & premium organic grocery.
              </p>
              
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3.5 pt-2">
                <Link
                  href="/shop"
                  className="btn btn-primary btn-lg rounded-xl font-bold text-sm shadow-lg shadow-emerald-950/40 hover:bg-emerald-500 transition-all flex items-center gap-2"
                >
                  <span>Explore Catalog</span>
                  <ArrowRight size={16} />
                </Link>
                <Link
                  href="/shop?category=pure-honey"
                  className="btn bg-white/10 hover:bg-white/20 text-white border border-white/20 btn-lg rounded-xl text-sm font-semibold backdrop-blur-sm"
                >
                  Pure Honey
                </Link>
              </div>

              {/* Trust counters */}
              <div className="grid grid-cols-3 gap-4 pt-6 border-t border-white/10 max-w-md mx-auto lg:mx-0 text-center lg:text-left">
                <div>
                  <div className="text-xl md:text-2xl font-extrabold text-amber-400">100%</div>
                  <div className="text-xs text-slate-300">Natural & Raw</div>
                </div>
                <div>
                  <div className="text-xl md:text-2xl font-extrabold text-amber-400">64</div>
                  <div className="text-xs text-slate-300">Districts Delivery</div>
                </div>
                <div>
                  <div className="text-xl md:text-2xl font-extrabold text-amber-400">15k+</div>
                  <div className="text-xs text-slate-300">Happy Families</div>
                </div>
              </div>
            </div>

            {/* Right Hero Image Card */}
            <div className="lg:col-span-5 relative flex justify-center">
              <div className="relative w-full max-w-md aspect-square rounded-3xl overflow-hidden shadow-2xl border-4 border-white/10 group">
                <img
                  src={banners[0]?.image || "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=800&q=80"}
                  alt="Organic ShuddhoBazar"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex flex-col justify-end p-6">
                  <span className="text-amber-400 font-bold text-xs uppercase tracking-wider">Featured Collection</span>
                  <h3 className="text-white text-xl font-bold">Sundarban Wild Honey & Pure Ghee</h3>
                  <p className="text-slate-300 text-xs mt-1">Direct from traditional hive harvesters</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. VALUE PROPOSITIONS & GUARANTEES */}
      <section className="container">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="card p-4 flex items-center gap-3.5 border-emerald-100/60 bg-emerald-50/40">
            <div className="w-11 h-11 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0">
              <ShieldCheck size={22} />
            </div>
            <div>
              <h4 className="font-bold text-slate-800 text-sm">100% Pure</h4>
              <p className="text-slate-500 text-xs">Lab tested organic</p>
            </div>
          </div>

          <div className="card p-4 flex items-center gap-3.5 border-amber-100/60 bg-amber-50/40">
            <div className="w-11 h-11 rounded-xl bg-amber-600 text-white flex items-center justify-center shrink-0">
              <Truck size={22} />
            </div>
            <div>
              <h4 className="font-bold text-slate-800 text-sm">Fast Delivery</h4>
              <p className="text-slate-500 text-xs">All 64 districts</p>
            </div>
          </div>

          <div className="card p-4 flex items-center gap-3.5 border-blue-100/60 bg-blue-50/40">
            <div className="w-11 h-11 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0">
              <HeartHandshake size={22} />
            </div>
            <div>
              <h4 className="font-bold text-slate-800 text-sm">Cash On Delivery</h4>
              <p className="text-slate-500 text-xs">Pay after check</p>
            </div>
          </div>

          <div className="card p-4 flex items-center gap-3.5 border-purple-100/60 bg-purple-50/40">
            <div className="w-11 h-11 rounded-xl bg-purple-600 text-white flex items-center justify-center shrink-0">
              <RotateCcw size={22} />
            </div>
            <div>
              <h4 className="font-bold text-slate-800 text-sm">Easy Returns</h4>
              <p className="text-slate-500 text-xs">Hassle-free replacement</p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. CATEGORIES CAROUSEL / GRID */}
      <section className="container">
        <div className="flex items-end justify-between mb-6">
          <div>
            <span className="text-xs font-bold text-emerald-600 tracking-wider uppercase">Collections</span>
            <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 mt-1">Shop By Category</h2>
          </div>
          <Link href="/categories" className="text-emerald-700 font-semibold text-xs md:text-sm flex items-center gap-1 hover:underline">
            <span>All Categories</span>
            <ChevronRight size={16} />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              href={`/shop?category=${cat.slug}`}
              className="card group p-3.5 flex flex-col items-center text-center hover:border-emerald-500 hover:shadow-md transition-all rounded-2xl"
            >
              <div className="w-20 h-20 rounded-2xl overflow-hidden bg-slate-100 mb-3 group-hover:scale-105 transition-transform duration-300">
                <img
                  src={cat.image || 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=300&q=80'}
                  alt={cat.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <h3 className="font-bold text-xs md:text-sm text-slate-800 group-hover:text-emerald-600 transition-colors line-clamp-1">
                {cat.name}
              </h3>
              <span className="text-[11px] text-slate-400 mt-0.5">
                {cat._count?.products || 4}+ Items
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* 4. FLASH SALE SECTION */}
      {flashSaleProducts.length > 0 && (
        <section className="container">
          <div className="bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 rounded-3xl p-6 md:p-8 text-white shadow-xl">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Zap size={22} className="text-amber-200 animate-bounce" />
                  <span className="font-extrabold text-sm md:text-base tracking-wider uppercase text-amber-200">Limited Time Offer</span>
                </div>
                <h2 className="text-2xl md:text-4xl font-extrabold text-white">Weekend Mega Flash Sale 🔥</h2>
              </div>

              {/* Countdown */}
              <div className="flex items-center gap-2 text-slate-900 font-extrabold">
                <div className="bg-white px-3 py-2 rounded-xl text-center shadow-md min-w-[50px]">
                  <div className="text-lg md:text-xl leading-none text-rose-600">{String(timeLeft.hours).padStart(2, '0')}</div>
                  <div className="text-[9px] text-slate-500 uppercase font-semibold">Hours</div>
                </div>
                <span className="text-white text-xl font-bold">:</span>
                <div className="bg-white px-3 py-2 rounded-xl text-center shadow-md min-w-[50px]">
                  <div className="text-lg md:text-xl leading-none text-rose-600">{String(timeLeft.minutes).padStart(2, '0')}</div>
                  <div className="text-[9px] text-slate-500 uppercase font-semibold">Mins</div>
                </div>
                <span className="text-white text-xl font-bold">:</span>
                <div className="bg-white px-3 py-2 rounded-xl text-center shadow-md min-w-[50px]">
                  <div className="text-lg md:text-xl leading-none text-rose-600">{String(timeLeft.seconds).padStart(2, '0')}</div>
                  <div className="text-[9px] text-slate-500 uppercase font-semibold">Secs</div>
                </div>
              </div>
            </div>

            {/* Flash Sale Product Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {flashSaleProducts.slice(0, 4).map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 5. TOP SELLING PRODUCTS */}
      <section className="container">
        <div className="flex items-end justify-between mb-6">
          <div>
            <span className="text-xs font-bold text-emerald-600 tracking-wider uppercase">Best Choices</span>
            <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 mt-1">Top Selling Products</h2>
          </div>
          <Link href="/shop?bestSelling=true" className="text-emerald-700 font-semibold text-xs md:text-sm flex items-center gap-1 hover:underline">
            <span>View All</span>
            <ChevronRight size={16} />
          </Link>
        </div>

        <div className="products-grid">
          {(bestSellingProducts.length > 0 ? bestSellingProducts : featuredProducts).slice(0, 8).map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {/* 6. PROMO BANNER: PURE GHEE & SUNDARBAN HONEY */}
      <section className="container">
        <div className="relative rounded-3xl overflow-hidden bg-slate-900 text-white min-h-[220px] md:min-h-[280px] flex items-center">
          <img
            src="https://images.unsplash.com/photo-1587049352846-4a222e784d38?auto=format&fit=crop&w=1600&q=80"
            alt="Sundarban honey promo"
            className="absolute inset-0 w-full h-full object-cover opacity-35"
          />
          <div className="relative z-10 p-6 md:p-12 max-w-xl space-y-3">
            <span className="badge badge-yellow font-bold uppercase text-xs">Direct From Hive</span>
            <h3 className="text-2xl md:text-4xl font-extrabold text-white leading-tight">
              Raw Sundarban Mangrove Honey
            </h3>
            <p className="text-slate-200 text-xs md:text-sm">
              Gathered by Mawals in the world’s largest mangrove forest. No artificial feeding, no heat treatment.
            </p>
            <Link href="/shop?category=pure-honey" className="btn btn-primary rounded-xl text-xs md:text-sm font-bold inline-flex items-center gap-2 mt-2">
              <span>Order Raw Honey</span>
              <ChevronRight size={14} />
            </Link>
          </div>
        </div>
      </section>

      {/* 7. NEW ARRIVALS */}
      <section className="container">
        <div className="flex items-end justify-between mb-6">
          <div>
            <span className="text-xs font-bold text-emerald-600 tracking-wider uppercase">Fresh Harvest</span>
            <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 mt-1">New Arrivals</h2>
          </div>
          <Link href="/shop?newArrival=true" className="text-emerald-700 font-semibold text-xs md:text-sm flex items-center gap-1 hover:underline">
            <span>View All</span>
            <ChevronRight size={16} />
          </Link>
        </div>

        <div className="products-grid">
          {(newProducts.length > 0 ? newProducts : featuredProducts).slice(0, 8).map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {/* 8. WHY CHOOSE SHUDDHO BAZAR */}
      <section className="bg-emerald-50/60 py-12 border-y border-emerald-100">
        <div className="container text-center space-y-8">
          <div className="max-w-2xl mx-auto space-y-2">
            <span className="text-xs font-bold text-emerald-700 tracking-widest uppercase">The Shuddho Guarantee</span>
            <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900">Why Families Trust ShuddhoBazar</h2>
            <p className="text-slate-600 text-sm">We ensure transparency at every stage — from village harvest to your dinner table.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
            <div className="card p-6 bg-white rounded-2xl border-slate-100 shadow-sm space-y-2.5">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-extrabold">
                1
              </div>
              <h4 className="font-bold text-slate-800 text-base">Direct Sourced From Farmers</h4>
              <p className="text-slate-500 text-xs leading-relaxed">
                We eliminate middlemen to ensure fair pricing for Bangladeshi farmers and unadulterated freshness for you.
              </p>
            </div>

            <div className="card p-6 bg-white rounded-2xl border-slate-100 shadow-sm space-y-2.5">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-extrabold">
                2
              </div>
              <h4 className="font-bold text-slate-800 text-base">Strict Quality Assurance</h4>
              <p className="text-slate-500 text-xs leading-relaxed">
                Each batch of honey, oil, and ghee undergoes rigorous sensory, purity, and lab evaluation before packaging.
              </p>
            </div>

            <div className="card p-6 bg-white rounded-2xl border-slate-100 shadow-sm space-y-2.5">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-extrabold">
                3
              </div>
              <h4 className="font-bold text-slate-800 text-base">Hygienic Food-Grade Packaging</h4>
              <p className="text-slate-500 text-xs leading-relaxed">
                Packaged in food-grade glass jars and airtight containers to lock in natural aroma, vitamins, and nutrients.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
