'use client'
import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { Search, Package, Clock, CheckCircle2, Truck, AlertCircle } from 'lucide-react'
import { formatPrice, formatDateTime } from '@/lib/utils'
import toast from 'react-hot-toast'

function TrackOrderContent() {
  const searchParams = useSearchParams()
  const [orderNumber, setOrderNumber] = useState(searchParams.get('order') || '')
  const [phone, setPhone] = useState(searchParams.get('phone') || '')
  const [order, setOrder] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [searched, setSearched] = useState(false)

  const handleTrack = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    if (!orderNumber.trim() || !phone.trim()) {
      toast.error('Please enter both Order ID and Phone Number')
      return
    }

    setLoading(true)
    setSearched(true)
    try {
      const res = await fetch(`/api/orders?orderNumber=${encodeURIComponent(orderNumber.trim())}&phone=${encodeURIComponent(phone.trim())}`)
      const data = await res.json()
      if (res.ok && data.success) {
        setOrder(data.data)
      } else {
        setOrder(null)
        toast.error('No matching order found')
      }
    } catch {
      toast.error('Error tracking order')
      setOrder(null)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (searchParams.get('order') && searchParams.get('phone')) {
      handleTrack()
    }
  }, [searchParams])

  const steps = [
    { key: 'PENDING', label: 'Order Placed' },
    { key: 'CONFIRMED', label: 'Confirmed' },
    { key: 'PROCESSING', label: 'Processing' },
    { key: 'SHIPPED', label: 'Shipped' },
    { key: 'DELIVERED', label: 'Delivered' },
  ]

  const getStepIndex = (status: string) => {
    const s = status.toUpperCase()
    if (s === 'PENDING') return 0
    if (s === 'CONFIRMED') return 1
    if (s === 'PROCESSING' || s === 'PACKED') return 2
    if (s === 'SHIPPED' || s === 'OUT_FOR_DELIVERY') return 3
    if (s === 'DELIVERED') return 4
    return 0
  }

  return (
    <div className="container py-8 max-w-2xl mx-auto space-y-8">
      <div className="text-center space-y-2">
        <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900">Track Your Order</h1>
        <p className="text-slate-500 text-xs md:text-sm">
          Enter your Order Number (e.g. SB-123456) and Billing Phone Number to track live status.
        </p>
      </div>

      {/* Search Input Box */}
      <form onSubmit={handleTrack} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="form-label text-xs font-bold text-slate-700">Order Number *</label>
            <input
              type="text"
              required
              placeholder="e.g. SB-123456"
              value={orderNumber}
              onChange={(e) => setOrderNumber(e.target.value)}
              className="input rounded-xl text-sm uppercase font-semibold"
            />
          </div>
          <div>
            <label className="form-label text-xs font-bold text-slate-700">Phone Number *</label>
            <input
              type="tel"
              required
              placeholder="017XXXXXXXX"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="input rounded-xl text-sm"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="btn btn-primary w-full rounded-2xl font-extrabold text-sm flex items-center justify-center gap-2"
        >
          <Search size={16} />
          <span>{loading ? 'Searching...' : 'Track Order (অর্ডার ট্র্যাক করুন)'}</span>
        </button>
      </form>

      {/* Order Status Display */}
      {order && (
        <div className="bg-white p-6 md:p-8 rounded-3xl border border-slate-100 shadow-sm space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-2 pb-4 border-b border-slate-100">
            <div>
              <span className="text-xs text-slate-400 font-medium">Order ID</span>
              <div className="text-lg font-extrabold text-slate-900">{order.orderNumber}</div>
            </div>
            <div className="text-right">
              <span className="text-xs text-slate-400 font-medium">Status</span>
              <div>
                <span className="badge badge-green font-bold text-xs">{order.status}</span>
              </div>
            </div>
          </div>

          {/* Timeline steps */}
          <div className="relative py-4">
            <div className="grid grid-cols-5 gap-2 text-center relative z-10">
              {steps.map((step, idx) => {
                const currentIdx = getStepIndex(order.status)
                const isPassed = idx <= currentIdx
                const isCurrent = idx === currentIdx

                return (
                  <div key={step.key} className="space-y-2 flex flex-col items-center">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                        isPassed
                          ? 'bg-emerald-600 text-white shadow-md'
                          : 'bg-slate-100 text-slate-400 border border-slate-200'
                      }`}
                    >
                      {isPassed ? <CheckCircle2 size={16} /> : idx + 1}
                    </div>
                    <span className={`text-[10px] sm:text-xs font-semibold ${isCurrent ? 'text-emerald-700' : 'text-slate-500'}`}>
                      {step.label}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Order Details Preview */}
          <div className="space-y-3 pt-4 border-t border-slate-100 text-xs">
            <div className="flex justify-between py-1 border-b border-slate-50">
              <span className="text-slate-500">Recipient Name</span>
              <span className="font-bold text-slate-800">{order.shippingName}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-50">
              <span className="text-slate-500">Delivery Address</span>
              <span className="font-medium text-slate-800 text-right max-w-xs">{order.shippingAddress}, {order.shippingDist}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-50">
              <span className="text-slate-500">Payment Method</span>
              <span className="font-bold text-slate-800">{order.paymentMethod}</span>
            </div>
            <div className="flex justify-between py-1 text-sm font-extrabold text-slate-900 pt-2">
              <span>Total Amount</span>
              <span className="text-emerald-700">{formatPrice(order.total)}</span>
            </div>
          </div>
        </div>
      )}

      {searched && !order && !loading && (
        <div className="p-8 text-center bg-white rounded-3xl border border-slate-100 space-y-2">
          <AlertCircle size={32} className="mx-auto text-rose-500" />
          <h3 className="font-bold text-slate-800 text-base">Order Not Found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Please double-check your Order Number and phone number or contact customer support for assistance.
          </p>
        </div>
      )}
    </div>
  )
}

export default function TrackOrderPage() {
  return (
    <Suspense fallback={<div className="container py-16 text-center text-slate-400">Loading order tracker...</div>}>
      <TrackOrderContent />
    </Suspense>
  )
}
