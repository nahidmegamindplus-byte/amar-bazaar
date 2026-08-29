'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Trash2, Plus, Minus, ArrowRight, ShoppingBag, Truck, ShieldCheck, Ticket } from 'lucide-react'
import { formatPrice } from '@/lib/utils'
import toast from 'react-hot-toast'

export default function CartClient() {
  const router = useRouter()
  const [cart, setCart] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [couponCode, setCouponCode] = useState('')
  const [couponDiscount, setCouponDiscount] = useState(0)
  const [applyingCoupon, setApplyingCoupon] = useState(false)

  const fetchCart = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/cart')
      const data = await res.json()
      if (data.success) {
        setCart(data.data)
      }
    } catch {
      toast.error('Failed to load cart')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCart()
  }, [])

  const updateQuantity = async (itemId: string, newQty: number) => {
    if (newQty < 1) return
    try {
      const res = await fetch('/api/cart', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ itemId, quantity: newQty }),
      })
      if (res.ok) {
        fetchCart()
      } else {
        const d = await res.json()
        toast.error(d.error || 'Update failed')
      }
    } catch {
      toast.error('Error updating quantity')
    }
  }

  const removeItem = async (itemId: string) => {
    try {
      const res = await fetch(`/api/cart?itemId=${itemId}`, {
        method: 'DELETE',
      })
      if (res.ok) {
        toast.success('Item removed')
        fetchCart()
      }
    } catch {
      toast.error('Error removing item')
    }
  }

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault()
    if (!couponCode.trim()) return
    setApplyingCoupon(true)
    setTimeout(() => {
      if (couponCode.toUpperCase() === 'SHUDDHO10') {
        const sub = items.reduce((acc: number, item: any) => {
          const p = item.variant?.salePrice || item.variant?.price || item.product.salePrice || item.product.regularPrice
          return acc + p * item.quantity
        }, 0)
        const disc = Math.round(sub * 0.1)
        setCouponDiscount(disc)
        toast.success('Coupon SHUDDHO10 applied! 10% OFF')
      } else if (couponCode.toUpperCase() === 'WELCOME50') {
        setCouponDiscount(50)
        toast.success('Coupon WELCOME50 applied! ৳50 OFF')
      } else {
        toast.error('Invalid coupon code')
      }
      setApplyingCoupon(false)
    }, 500)
  }

  const items = cart?.items || []
  const subtotal = items.reduce((acc: number, item: any) => {
    const p = item.variant?.salePrice || item.variant?.price || item.product.salePrice || item.product.regularPrice
    return acc + p * item.quantity
  }, 0)

  const freeShippingThreshold = 999
  const progressToFreeShip = Math.min(100, Math.round((subtotal / freeShippingThreshold) * 100))
  const total = Math.max(0, subtotal - couponDiscount)

  if (loading) {
    return (
      <div className="container py-16 text-center text-slate-400">
        <div className="animate-spin text-3xl mb-3">⏳</div>
        <p className="text-sm">Loading your cart items...</p>
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <div className="container py-16 max-w-md mx-auto text-center space-y-4">
        <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto text-slate-400">
          <ShoppingBag size={36} />
        </div>
        <h2 className="text-2xl font-extrabold text-slate-900">Your Cart is Empty</h2>
        <p className="text-slate-500 text-xs leading-relaxed">
          Looks like you haven’t added any natural organic grocery items yet. Explore our farm fresh collections!
        </p>
        <Link href="/shop" className="btn btn-primary rounded-xl font-bold text-sm inline-flex items-center gap-2">
          <span>Start Shopping</span>
          <ArrowRight size={16} />
        </Link>
      </div>
    )
  }

  return (
    <div className="container py-8 space-y-8">
      <div>
        <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900">Shopping Cart</h1>
        <p className="text-slate-500 text-xs md:text-sm mt-1">{items.length} unique items in your basket</p>
      </div>

      {/* Free Shipping Progress Indicator */}
      <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100 space-y-2">
        <div className="flex items-center justify-between text-xs font-semibold text-emerald-800">
          <span className="flex items-center gap-1.5">
            <Truck size={15} />
            {subtotal >= freeShippingThreshold ? (
              <span>🎉 Congratulations! You unlocked <strong>FREE Delivery</strong></span>
            ) : (
              <span>Add <strong>{formatPrice(freeShippingThreshold - subtotal)}</strong> more for <strong>FREE Delivery</strong> (Dhaka)</span>
            )}
          </span>
          <span>{progressToFreeShip}%</span>
        </div>
        <div className="w-full bg-emerald-200/60 rounded-full h-2 overflow-hidden">
          <div
            className="bg-emerald-600 h-full rounded-full transition-all duration-500"
            style={{ width: `${progressToFreeShip}%` }}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left: Cart Items List */}
        <div className="lg:col-span-8 bg-white rounded-3xl border border-slate-100 p-4 md:p-6 shadow-xs space-y-4">
          <div className="divide-y divide-slate-100">
            {items.map((item: any) => {
              const unitPrice = item.variant?.salePrice || item.variant?.price || item.product.salePrice || item.product.regularPrice
              const itemTotal = unitPrice * item.quantity

              return (
                <div key={item.id} className="py-4 first:pt-0 last:pb-0 flex items-center gap-4">
                  {/* Thumbnail */}
                  <div className="w-20 h-20 rounded-2xl bg-slate-50 border border-slate-100 overflow-hidden shrink-0">
                    <img
                      src={item.product.thumbnail || 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=300&q=80'}
                      alt={item.product.name}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0 space-y-1">
                    <Link
                      href={`/product/${item.product.slug}`}
                      className="font-bold text-slate-800 text-sm hover:text-emerald-600 line-clamp-1"
                    >
                      {item.product.name}
                    </Link>
                    {item.variant && (
                      <span className="text-[11px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md inline-block font-medium">
                        Variant: {item.variant.name}
                      </span>
                    )}
                    <div className="text-xs font-extrabold text-emerald-700">
                      {formatPrice(unitPrice)}
                    </div>
                  </div>

                  {/* Quantity Stepper */}
                  <div className="inline-flex items-center border border-slate-200 rounded-xl bg-white overflow-hidden shrink-0">
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      className="p-1.5 text-slate-500 hover:bg-slate-100 transition-colors"
                    >
                      <Minus size={12} />
                    </button>
                    <span className="w-8 text-center text-xs font-bold text-slate-800">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      className="p-1.5 text-slate-500 hover:bg-slate-100 transition-colors"
                    >
                      <Plus size={12} />
                    </button>
                  </div>

                  {/* Item Total */}
                  <div className="text-right shrink-0 min-w-[70px]">
                    <div className="font-extrabold text-sm text-slate-900">{formatPrice(itemTotal)}</div>
                  </div>

                  {/* Remove CTA */}
                  <button
                    onClick={() => removeItem(item.id)}
                    className="p-2 text-slate-300 hover:text-rose-600 rounded-lg transition-colors shrink-0"
                    title="Remove item"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              )
            })}
          </div>
        </div>

        {/* Right: Order Summary Card */}
        <div className="lg:col-span-4 bg-white rounded-3xl border border-slate-100 p-6 shadow-xs space-y-6">
          <h3 className="text-lg font-extrabold text-slate-900">Order Summary</h3>

          {/* Promo code field */}
          <form onSubmit={handleApplyCoupon} className="space-y-2">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
              Promo / Coupon Code
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="e.g. SHUDDHO10"
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value)}
                className="input py-2 text-xs rounded-xl uppercase font-semibold"
              />
              <button
                type="submit"
                disabled={applyingCoupon || !couponCode.trim()}
                className="btn btn-outline btn-sm rounded-xl font-bold text-xs shrink-0"
              >
                Apply
              </button>
            </div>
          </form>

          {/* Cost details */}
          <div className="space-y-2.5 text-xs text-slate-600 border-t border-slate-100 pt-4">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span className="font-bold text-slate-900">{formatPrice(subtotal)}</span>
            </div>
            {couponDiscount > 0 && (
              <div className="flex justify-between text-emerald-600 font-semibold">
                <span>Coupon Discount</span>
                <span>-{formatPrice(couponDiscount)}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span>Estimated Delivery</span>
              <span className="text-slate-500">Calculated at checkout</span>
            </div>
            <div className="flex justify-between text-base font-extrabold text-slate-900 border-t border-slate-100 pt-3">
              <span>Estimated Total</span>
              <span className="text-emerald-700">{formatPrice(total)}</span>
            </div>
          </div>

          <Link
            href="/checkout"
            className="btn btn-primary btn-lg w-full rounded-2xl font-extrabold text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-700/20"
          >
            <span>Proceed to Checkout</span>
            <ArrowRight size={16} />
          </Link>

          <div className="text-[11px] text-slate-400 flex items-center justify-center gap-2">
            <ShieldCheck size={14} className="text-emerald-600" />
            <span>Guaranteed Safe & Secure Checkout</span>
          </div>
        </div>
      </div>
    </div>
  )
}
