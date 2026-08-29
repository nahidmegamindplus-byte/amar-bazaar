'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  ShieldCheck, Truck, CreditCard, ShoppingBag, CheckCircle2,
  Lock, ArrowRight, Phone, MapPin, User, AlertCircle
} from 'lucide-react'
import { formatPrice } from '@/lib/utils'
import toast from 'react-hot-toast'

interface CheckoutClientProps {
  deliveryZones: any[]
  checkoutSettings?: {
    checkoutTitle?: string
    checkoutSubtitle?: string
    checkoutNotice?: string
    showNotice?: boolean
    deliveryInsideDhaka?: number
    deliveryOutsideDhaka?: number
    freeDeliveryThreshold?: number
    showEmailField?: boolean
    showDeliveryNote?: boolean
    showCouponBox?: boolean
    orderButtonText?: string
    trustBadge1?: string
    trustBadge2?: string
    trustBadge3?: string
    bkashNumber?: string
    bkashNote?: string
    nagadNumber?: string
    nagadNote?: string
    rocketNumber?: string
    rocketNote?: string
  }
}

const BD_DIVISIONS = [
  'Dhaka', 'Chattogram', 'Rajshahi', 'Khulna', 'Barishal', 'Sylhet', 'Rangpur', 'Mymensingh'
]

export default function CheckoutClient({ deliveryZones, checkoutSettings }: CheckoutClientProps) {
  const router = useRouter()
  const [cart, setCart] = useState<any>(null)
  const [loadingCart, setLoadingCart] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  // Delivery configuration from admin settings
  const insideCharge = checkoutSettings?.deliveryInsideDhaka ?? 60
  const outsideCharge = checkoutSettings?.deliveryOutsideDhaka ?? 130
  const freeThreshold = checkoutSettings?.freeDeliveryThreshold ?? 999

  // Form State
  const [shippingName, setShippingName] = useState('')
  const [shippingPhone, setShippingPhone] = useState('')
  const [shippingEmail, setShippingEmail] = useState('')
  const [shippingDiv, setShippingDiv] = useState('Dhaka')
  const [shippingDist, setShippingDist] = useState('Dhaka')
  const [shippingArea, setShippingArea] = useState('')
  const [shippingAddress, setShippingAddress] = useState('')
  const [deliveryNote, setDeliveryNote] = useState('')

  // Zone & Shipping charge
  const defaultZone = deliveryZones[0] || null
  const [selectedZoneId, setSelectedZoneId] = useState<string>(defaultZone?.id || '')
  const [deliveryCharge, setDeliveryCharge] = useState<number>(insideCharge)

  // Payment Method
  const [paymentMethod, setPaymentMethod] = useState<'COD' | 'BKASH' | 'NAGAD' | 'ROCKET'>('COD')

  // Coupon
  const [couponCode, setCouponCode] = useState('')
  const [couponDiscount, setCouponDiscount] = useState(0)


  // Draft Checkout Session ID for Incomplete Order Tracking
  const [sessionId, setSessionId] = useState<string>('')

  useEffect(() => {
    let sid = ''
    try {
      sid = sessionStorage.getItem('sb_checkout_draft_id') || ''
      if (!sid) {
        sid = 'chk_' + Math.random().toString(36).substring(2, 9) + '_' + Date.now()
        sessionStorage.setItem('sb_checkout_draft_id', sid)
      }
    } catch {
      sid = 'chk_' + Math.random().toString(36).substring(2, 9) + '_' + Date.now()
    }
    setSessionId(sid)
  }, [])

  // Auto-fill from logged in user profile & address if available
  useEffect(() => {
    fetch('/api/auth/me')
      .then((r) => r.json())
      .then((d) => {
        if (d.success && d.user) {
          const u = d.user
          if (u.name) setShippingName((prev) => prev || u.name)
          if (u.phone) setShippingPhone((prev) => prev || u.phone)
          if (u.email) setShippingEmail((prev) => prev || u.email)
          if (u.addresses && u.addresses.length > 0) {
            const addr = u.addresses[0]
            if (addr.name) setShippingName((prev) => prev || addr.name)
            if (addr.phone) setShippingPhone((prev) => prev || addr.phone)
            if (addr.division) setShippingDiv((prev) => prev || addr.division)
            if (addr.district) setShippingDist((prev) => prev || addr.district)
            if (addr.area) setShippingArea((prev) => prev || addr.area)
            if (addr.fullAddress) setShippingAddress((prev) => prev || addr.fullAddress)
          }
        }
      })
      .catch(() => {})
  }, [])

  useEffect(() => {
    fetchCart()
  }, [])

  const fetchCart = async () => {
    try {
      const res = await fetch('/api/cart')
      const data = await res.json()
      if (data.success) {
        setCart(data.data)
      }
    } catch {
      toast.error('Failed to load cart for checkout')
    } finally {
      setLoadingCart(false)
    }
  }

  const items = cart?.items || []
  const subtotal = items.reduce((acc: number, item: any) => {
    const p = item.variant?.salePrice || item.variant?.price || item.product.salePrice || item.product.regularPrice
    return acc + p * item.quantity
  }, 0)

  // Update delivery charge when zone or subtotal changes
  useEffect(() => {
    if (shippingDiv.toLowerCase() === 'dhaka') {
      setDeliveryCharge(subtotal >= freeThreshold ? 0 : insideCharge)
    } else {
      setDeliveryCharge(outsideCharge)
    }
  }, [shippingDiv, subtotal, insideCharge, outsideCharge, freeThreshold])

  const grandTotal = Math.max(0, subtotal - couponDiscount + deliveryCharge)


  // Auto-Save Incomplete Order Draft (Debounced 700ms)
  useEffect(() => {
    if (!sessionId || items.length === 0) return

    // Only save if user has entered phone, name, or address or has cart items
    const hasContact = Boolean(shippingPhone.trim() || shippingName.trim() || shippingAddress.trim())
    if (!hasContact) return

    const timer = setTimeout(() => {
      const formattedItems = items.map((i: any) => ({
        productId: i.productId,
        variantId: i.variantId || undefined,
        productName: i.product?.name || 'Product',
        variantName: i.variant?.name || undefined,
        thumbnail: i.product?.thumbnail || undefined,
        unitPrice: i.product?.regularPrice || 0,
        salePrice: i.variant?.salePrice || i.variant?.price || i.product?.salePrice || i.product?.regularPrice || 0,
        quantity: i.quantity,
        total: (i.variant?.salePrice || i.variant?.price || i.product?.salePrice || i.product?.regularPrice || 0) * i.quantity,
      }))

      let lastStep = 'CART_ITEMS_VIEWED'
      if (shippingAddress.trim().length > 3) lastStep = 'ADDRESS_ENTERED'
      else if (shippingPhone.trim().length >= 6) lastStep = 'PHONE_ENTERED'
      else if (shippingName.trim().length >= 2) lastStep = 'NAME_ENTERED'

      fetch('/api/incomplete-orders/draft', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          customerName: shippingName.trim() || undefined,
          phone: shippingPhone.trim() || undefined,
          email: shippingEmail.trim() || undefined,
          division: shippingDiv,
          district: shippingDist,
          area: shippingArea,
          address: shippingAddress.trim() || undefined,
          deliveryNote: deliveryNote.trim() || undefined,
          paymentMethod,
          couponCode: couponDiscount > 0 ? couponCode : undefined,
          subtotal,
          deliveryCharge,
          discount: couponDiscount,
          total: grandTotal,
          items: formattedItems,
          lastStep,
        }),
      }).catch(() => {})
    }, 700)

    return () => clearTimeout(timer)
  }, [
    sessionId,
    items,
    shippingName,
    shippingPhone,
    shippingEmail,
    shippingDiv,
    shippingDist,
    shippingArea,
    shippingAddress,
    deliveryNote,
    paymentMethod,
    couponDiscount,
    grandTotal,
    deliveryCharge,
    subtotal
  ])

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault()
    if (!couponCode.trim()) return
    if (couponCode.toUpperCase() === 'SHUDDHO10') {
      const disc = Math.round(subtotal * 0.1)
      setCouponDiscount(disc)
      toast.success('Coupon SHUDDHO10 applied (10% OFF)!')
    } else if (couponCode.toUpperCase() === 'WELCOME50') {
      setCouponDiscount(50)
      toast.success('Coupon WELCOME50 applied (৳50 OFF)!')
    } else {
      toast.error('Invalid coupon code')
    }
  }

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!shippingName.trim()) return toast.error('Please provide recipient full name')
    if (!shippingPhone.trim() || shippingPhone.length < 11) return toast.error('Please enter a valid 11-digit Bangladeshi mobile number')
    if (!shippingAddress.trim() || shippingAddress.length < 5) return toast.error('Please provide a detailed delivery address')

    if (items.length === 0) {
      toast.error('Your cart is empty')
      return
    }

    setSubmitting(true)
    try {
      const payload = {
        shippingName,
        shippingPhone,
        shippingEmail: shippingEmail || undefined,
        shippingDiv,
        shippingDist: shippingDist || shippingDiv,
        shippingArea: shippingArea || 'City Area',
        shippingAddress,
        deliveryNote: deliveryNote || undefined,
        zoneId: selectedZoneId || undefined,
        couponCode: couponDiscount > 0 ? couponCode : undefined,
        paymentMethod,
        checkoutSessionId: sessionId || undefined,
        items: items.map((i: any) => ({
          productId: i.productId,
          variantId: i.variantId || undefined,
          quantity: i.quantity,
        })),
      }

      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      const data = await res.json()
      if (res.ok && data.success) {
        // Clear draft session
        try {
          sessionStorage.removeItem('sb_checkout_draft_id')
        } catch {}

        toast.success('🎉 Order Placed Successfully!')
        router.push(`/order-success?order=${data.data.orderNumber}&phone=${encodeURIComponent(shippingPhone)}`)

      } else {
        toast.error(data.error || 'Failed to place order')
      }
    } catch {
      toast.error('Network error. Could not place order.')
    } finally {
      setSubmitting(false)
    }
  }

  if (loadingCart) {
    return (
      <div className="container py-16 text-center text-slate-400">
        <div className="animate-spin text-3xl mb-3">⏳</div>
        <p className="text-sm">Preparing checkout...</p>
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <div className="container py-16 max-w-md mx-auto text-center space-y-4">
        <h2 className="text-2xl font-extrabold text-slate-900">Your Cart is Empty</h2>
        <p className="text-slate-500 text-xs">Add items to cart before proceeding to checkout.</p>
        <Link href="/shop" className="btn btn-primary rounded-xl font-bold text-sm">
          Return to Shop
        </Link>
      </div>
    )
  }

  return (
    <div className="container py-8 space-y-6">
      {/* Dynamic Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900">
          {checkoutSettings?.checkoutTitle || 'Checkout'}
        </h1>
        <p className="text-slate-500 text-xs md:text-sm mt-1">
          {checkoutSettings?.checkoutSubtitle || 'Complete your order with Cash on Delivery or Mobile Banking'}
        </p>
      </div>

      {/* Dynamic Promo Notice Banner */}
      {checkoutSettings?.showNotice !== false && checkoutSettings?.checkoutNotice && (
        <div className="bg-gradient-to-r from-emerald-50 to-emerald-100/70 border border-emerald-200/80 rounded-2xl p-4 flex items-center gap-3 text-xs text-emerald-900 font-semibold shadow-xs">
          <span className="text-lg">📢</span>
          <span>{checkoutSettings.checkoutNotice}</span>
        </div>
      )}

      <form onSubmit={handlePlaceOrder} className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left: Shipping & Payment Form */}
        <div className="lg:col-span-7 space-y-6">
          {/* 1. Customer Shipping Address */}
          <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-xs space-y-4">
            <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
              <MapPin size={18} className="text-emerald-600" />
              <span>1. Delivery Information (ডেলিভারি ঠিকানা)</span>
            </h3>

            <div className="space-y-4">
              <div>
                <label className="form-label text-xs font-bold uppercase text-slate-700">Full Name (সম্পূর্ণ নাম) *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Mohammad Rahim"
                  value={shippingName}
                  onChange={(e) => setShippingName(e.target.value)}
                  className="input rounded-xl text-sm"
                />
              </div>

              <div className={`grid grid-cols-1 ${checkoutSettings?.showEmailField !== false ? 'sm:grid-cols-2' : ''} gap-4`}>
                <div>
                  <label className="form-label text-xs font-bold uppercase text-slate-700">Mobile Number (ফোন নম্বর) *</label>
                  <input
                    type="tel"
                    required
                    placeholder="017XXXXXXXX"
                    value={shippingPhone}
                    onChange={(e) => setShippingPhone(e.target.value)}
                    className="input rounded-xl text-sm"
                  />
                </div>
                {checkoutSettings?.showEmailField !== false && (
                  <div>
                    <label className="form-label text-xs font-bold uppercase text-slate-700">Email Address (ঐচ্ছিক)</label>
                    <input
                      type="email"
                      placeholder="name@example.com"
                      value={shippingEmail}
                      onChange={(e) => setShippingEmail(e.target.value)}
                      className="input rounded-xl text-sm"
                    />
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="form-label text-xs font-bold uppercase text-slate-700">Division (বিভাগ) *</label>
                  <select
                    value={shippingDiv}
                    onChange={(e) => setShippingDiv(e.target.value)}
                    className="select rounded-xl text-xs bg-white"
                  >
                    {BD_DIVISIONS.map((div) => (
                      <option key={div} value={div}>{div}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="form-label text-xs font-bold uppercase text-slate-700">District (জেলা) *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Dhanmondi, Dhaka"
                    value={shippingDist}
                    onChange={(e) => setShippingDist(e.target.value)}
                    className="input rounded-xl text-xs"
                  />
                </div>
                <div>
                  <label className="form-label text-xs font-bold uppercase text-slate-700">Area / Thana (থানা)</label>
                  <input
                    type="text"
                    placeholder="e.g. Mirpur-10"
                    value={shippingArea}
                    onChange={(e) => setShippingArea(e.target.value)}
                    className="input rounded-xl text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="form-label text-xs font-bold uppercase text-slate-700">Full Detailed Address (বিস্তারিত ঠিকানা) *</label>
                <textarea
                  required
                  rows={2}
                  placeholder="House #, Road #, Flat #, Landmark..."
                  value={shippingAddress}
                  onChange={(e) => setShippingAddress(e.target.value)}
                  className="input rounded-xl text-sm"
                />
              </div>

              {checkoutSettings?.showDeliveryNote !== false && (
                <div>
                  <label className="form-label text-xs font-bold uppercase text-slate-700">Delivery Instructions / Note (ঐচ্ছিক)</label>
                  <input
                    type="text"
                    placeholder="e.g. Call before delivery, deliver after 3pm"
                    value={deliveryNote}
                    onChange={(e) => setDeliveryNote(e.target.value)}
                    className="input rounded-xl text-xs"
                  />
                </div>
              )}
            </div>
          </div>

          {/* 2. Payment Method Selector */}
          <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-xs space-y-4">
            <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
              <CreditCard size={18} className="text-emerald-600" />
              <span>2. Payment Method (পেমেন্ট পদ্ধতি)</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Cash On Delivery */}
              <label
                className={`p-4 rounded-2xl border-2 cursor-pointer flex items-center gap-3 transition-all ${
                  paymentMethod === 'COD'
                    ? 'border-emerald-600 bg-emerald-50/50 shadow-xs'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <input
                  type="radio"
                  name="payment"
                  checked={paymentMethod === 'COD'}
                  onChange={() => setPaymentMethod('COD')}
                  className="text-emerald-600"
                />
                <div>
                  <div className="font-bold text-sm text-slate-900">Cash on Delivery</div>
                  <div className="text-[11px] text-slate-500">পণ্য হাতে পেয়ে মূল্য পরিশোধ করুন</div>
                </div>
              </label>

              {/* bKash */}
              <label
                className={`p-4 rounded-2xl border-2 cursor-pointer flex items-center gap-3 transition-all ${
                  paymentMethod === 'BKASH'
                    ? 'border-rose-500 bg-rose-50/50 shadow-xs'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <input
                  type="radio"
                  name="payment"
                  checked={paymentMethod === 'BKASH'}
                  onChange={() => setPaymentMethod('BKASH')}
                  className="text-rose-600"
                />
                <div>
                  <div className="font-bold text-sm text-slate-900">bKash (বিকাশ)</div>
                  <div className="text-[11px] text-slate-500">Direct mobile wallet transfer</div>
                </div>
              </label>

              {/* Nagad */}
              <label
                className={`p-4 rounded-2xl border-2 cursor-pointer flex items-center gap-3 transition-all ${
                  paymentMethod === 'NAGAD'
                    ? 'border-orange-500 bg-orange-50/50 shadow-xs'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <input
                  type="radio"
                  name="payment"
                  checked={paymentMethod === 'NAGAD'}
                  onChange={() => setPaymentMethod('NAGAD')}
                  className="text-orange-600"
                />
                <div>
                  <div className="font-bold text-sm text-slate-900">Nagad (নগদ)</div>
                  <div className="text-[11px] text-slate-500">Fast digital payment</div>
                </div>
              </label>

              {/* Rocket */}
              <label
                className={`p-4 rounded-2xl border-2 cursor-pointer flex items-center gap-3 transition-all ${
                  paymentMethod === 'ROCKET'
                    ? 'border-purple-500 bg-purple-50/50 shadow-xs'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <input
                  type="radio"
                  name="payment"
                  checked={paymentMethod === 'ROCKET'}
                  onChange={() => setPaymentMethod('ROCKET')}
                  className="text-purple-600"
                />
                <div>
                  <div className="font-bold text-sm text-slate-900">Rocket (রকেট)</div>
                  <div className="text-[11px] text-slate-500">DBBL Mobile banking</div>
                </div>
              </label>
            </div>

            {/* Mobile Banking Instructions Box */}
            {paymentMethod === 'BKASH' && (
              <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-xs text-rose-950 space-y-1.5 animate-fadeIn">
                <div className="font-bold text-rose-800 flex items-center gap-1.5">
                  <span>📱 বিকাশ পেমেন্ট নির্দেশিকা:</span>
                </div>
                {checkoutSettings?.bkashNumber && (
                  <p className="font-mono font-bold text-rose-900 text-sm">
                    বিকাশ নম্বর: {checkoutSettings.bkashNumber}
                  </p>
                )}
                <p className="text-slate-700">
                  {checkoutSettings?.bkashNote || 'উক্ত নম্বরে বিকাশ সেন্ড মানি বা পেমেন্ট করে অর্ডার সাবমিট করুন। কাস্টমার কেয়ার থেকে কল করে ভেরিফাই করা হবে।'}
                </p>
              </div>
            )}

            {paymentMethod === 'NAGAD' && (
              <div className="p-4 rounded-2xl bg-orange-50 border border-orange-200 text-xs text-orange-950 space-y-1.5 animate-fadeIn">
                <div className="font-bold text-orange-800 flex items-center gap-1.5">
                  <span>📱 নগদ পেমেন্ট নির্দেশিকা:</span>
                </div>
                {checkoutSettings?.nagadNumber && (
                  <p className="font-mono font-bold text-orange-900 text-sm">
                    নগদ নম্বর: {checkoutSettings.nagadNumber}
                  </p>
                )}
                <p className="text-slate-700">
                  {checkoutSettings?.nagadNote || 'উক্ত নম্বরে নগদ সেন্ড মানি করে অর্ডার সাবমিট করুন।'}
                </p>
              </div>
            )}

            {paymentMethod === 'ROCKET' && (
              <div className="p-4 rounded-2xl bg-purple-50 border border-purple-200 text-xs text-purple-950 space-y-1.5 animate-fadeIn">
                <div className="font-bold text-purple-800 flex items-center gap-1.5">
                  <span>📱 রকেট পেমেন্ট নির্দেশিকা:</span>
                </div>
                {checkoutSettings?.rocketNumber && (
                  <p className="font-mono font-bold text-purple-900 text-sm">
                    রকেট নম্বর: {checkoutSettings.rocketNumber}
                  </p>
                )}
                <p className="text-slate-700">
                  {checkoutSettings?.rocketNote || 'উক্ত নম্বরে রকেট পেমেন্ট সম্পন্ন করে অর্ডার সাবমিট করুন।'}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Right: Order Summary Breakdown & Place Order CTA */}
        <div className="lg:col-span-5 bg-white rounded-3xl border border-slate-100 p-6 shadow-xs space-y-6">
          <h3 className="text-lg font-extrabold text-slate-900 flex items-center justify-between">
            <span>Order Summary</span>
            <span className="text-xs font-normal text-slate-400">({items.length} items)</span>
          </h3>

          {/* Items Preview */}
          <div className="divide-y divide-slate-100 max-h-60 overflow-y-auto pr-1">
            {items.map((item: any) => {
              const unitPrice = item.variant?.salePrice || item.variant?.price || item.product.salePrice || item.product.regularPrice
              return (
                <div key={item.id} className="py-2.5 flex items-center gap-3 text-xs">
                  <img
                    src={item.product.thumbnail || 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=150&q=80'}
                    alt={item.product.name}
                    className="w-12 h-12 rounded-xl object-cover border border-slate-100 shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-slate-800 line-clamp-1">{item.product.name}</div>
                    <div className="text-slate-400 text-[11px]">Qty: {item.quantity} {item.variant ? `(${item.variant.name})` : ''}</div>
                  </div>
                  <div className="font-bold text-slate-900 shrink-0">
                    {formatPrice(unitPrice * item.quantity)}
                  </div>
                </div>
              )
            })}
          </div>

          {/* Coupon input */}
          {checkoutSettings?.showCouponBox !== false && (
            <div className="pt-2 border-t border-slate-100">
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="PROMO CODE"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                  className="input py-2 text-xs rounded-xl uppercase font-semibold"
                />
                <button
                  type="button"
                  onClick={handleApplyCoupon}
                  className="btn btn-outline btn-sm rounded-xl font-bold text-xs shrink-0"
                >
                  Apply
                </button>
              </div>
            </div>
          )}

          {/* Price Breakdown */}
          <div className="space-y-2 text-xs text-slate-600 border-t border-slate-100 pt-4">
            <div className="flex justify-between">
              <span>Items Subtotal</span>
              <span className="font-bold text-slate-900">{formatPrice(subtotal)}</span>
            </div>
            {couponDiscount > 0 && (
              <div className="flex justify-between text-emerald-600 font-semibold">
                <span>Coupon Discount</span>
                <span>-{formatPrice(couponDiscount)}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span>Delivery Charge ({shippingDiv})</span>
              <span className="font-bold text-slate-900">
                {deliveryCharge === 0 ? <span className="text-emerald-600 uppercase font-bold text-[11px]">Free</span> : formatPrice(deliveryCharge)}
              </span>
            </div>
            <div className="flex justify-between text-base font-extrabold text-slate-900 border-t border-slate-100 pt-3">
              <span>Total Payable</span>
              <span className="text-emerald-700">{formatPrice(grandTotal)}</span>
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="btn btn-primary btn-lg w-full rounded-2xl font-extrabold text-sm flex items-center justify-center gap-2 shadow-xl shadow-emerald-700/20 active:scale-98 transition-all"
          >
            {submitting ? (
              <span>Placing Order... ⏳</span>
            ) : (
              <>
                <span>{checkoutSettings?.orderButtonText || 'Confirm Order (অর্ডার সম্পন্ন করুন)'}</span>
                <ArrowRight size={16} />
              </>
            )}
          </button>

          {/* Trust Badges */}
          <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-100 text-center">
            <div className="p-2 rounded-xl bg-slate-50 border border-slate-100/60">
              <div className="text-xs mb-0.5">🛡️</div>
              <div className="text-[10px] font-bold text-slate-700 leading-tight">
                {checkoutSettings?.trustBadge1 || '১০০% নিরাপদ ডেলিভারি'}
              </div>
            </div>
            <div className="p-2 rounded-xl bg-slate-50 border border-slate-100/60">
              <div className="text-xs mb-0.5">💵</div>
              <div className="text-[10px] font-bold text-slate-700 leading-tight">
                {checkoutSettings?.trustBadge2 || 'ক্যাশ অন ডেলিভারি'}
              </div>
            </div>
            <div className="p-2 rounded-xl bg-slate-50 border border-slate-100/60">
              <div className="text-xs mb-0.5">📦</div>
              <div className="text-[10px] font-bold text-slate-700 leading-tight">
                {checkoutSettings?.trustBadge3 || 'পণ্য দেখে পেমেন্ট'}
              </div>
            </div>
          </div>

          <p className="text-[11px] text-slate-400 text-center leading-relaxed">
            By placing order, you agree to ShuddhoBazar Terms of Service & Privacy Policy.
          </p>
        </div>
      </form>
    </div>
  )
}

