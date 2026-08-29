'use client'
import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import {
  CheckCircle2, Package, Truck, Phone, MapPin, Copy,
  ArrowRight, MessageCircle, Home, Calendar, Clock, ShoppingBag
} from 'lucide-react'
import { formatPrice, formatDate, formatDateTime } from '@/lib/utils'
import toast from 'react-hot-toast'

export default function OrderSuccessClient() {
  const searchParams = useSearchParams()
  const orderNumber = searchParams.get('order') || ''
  const phone = searchParams.get('phone') || ''

  const [order, setOrder] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (orderNumber && phone) {
      fetch(`/api/orders?orderNumber=${encodeURIComponent(orderNumber)}&phone=${encodeURIComponent(phone)}`)
        .then((r) => r.json())
        .then((data) => {
          if (data.success) setOrder(data.data)
        })
        .catch(() => {})
        .finally(() => setLoading(false))
    } else {
      setLoading(false)
    }
  }, [orderNumber, phone])

  const copyOrderNumber = () => {
    if (orderNumber) {
      navigator.clipboard.writeText(orderNumber)
      toast.success('Order ID copied to clipboard!')
    }
  }

  return (
    <div className="container py-12 max-w-3xl mx-auto space-y-8">
      {/* 1. Thank You Banner Header */}
      <div className="bg-white rounded-3xl border border-emerald-100 p-8 md:p-12 text-center space-y-4 shadow-sm relative overflow-hidden">
        <div className="absolute -top-12 -right-12 w-40 h-40 bg-emerald-50 rounded-full opacity-50 pointer-events-none" />
        <div className="absolute -bottom-12 -left-12 w-40 h-40 bg-amber-50 rounded-full opacity-50 pointer-events-none" />

        <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
          <CheckCircle2 size={44} className="text-emerald-600 animate-bounce" />
        </div>

        <div className="space-y-2 relative z-10">
          <span className="badge badge-green font-bold text-xs uppercase tracking-wider px-3 py-1">
            Order Confirmed 🎉
          </span>
          <h1 className="text-2xl md:text-4xl font-extrabold text-slate-900">
            ধন্যবাদ! আপনার অর্ডারটি সফলভাবে সম্পন্ন হয়েছে
          </h1>
          <p className="text-slate-500 text-xs md:text-sm max-w-lg mx-auto leading-relaxed">
            Thank you for choosing <strong>ShuddhoBazar</strong>! We have received your order and our team is preparing fresh organic items for speedy delivery.
          </p>
        </div>

        {/* Order Number Tag */}
        {orderNumber && (
          <div className="inline-flex items-center gap-3 bg-slate-50 border border-slate-200 px-4 py-2.5 rounded-2xl mt-2">
            <span className="text-xs text-slate-500">Order Tracking ID:</span>
            <strong className="text-slate-900 font-mono text-sm md:text-base">{orderNumber}</strong>
            <button
              onClick={copyOrderNumber}
              className="p-1 text-slate-400 hover:text-emerald-600 transition-colors"
              title="Copy ID"
            >
              <Copy size={15} />
            </button>
          </div>
        )}
      </div>

      {/* 2. Order Details Breakdown (If loaded) */}
      {order ? (
        <div className="bg-white rounded-3xl border border-slate-100 p-6 md:p-8 space-y-6 shadow-xs">
          <div className="flex flex-wrap items-center justify-between gap-2 pb-4 border-b border-slate-100">
            <div>
              <h3 className="font-extrabold text-base text-slate-900 flex items-center gap-2">
                <Package size={18} className="text-emerald-600" />
                <span>Order Summary (অর্ডার বিবরণী)</span>
              </h3>
              <span className="text-xs text-slate-400">{formatDate(order.createdAt)}</span>
            </div>
            <div>
              <span className="badge badge-green font-bold text-xs">{order.status}</span>
            </div>
          </div>

          {/* Delivery & Contact Summary */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-100 text-xs">
            <div className="space-y-1">
              <span className="text-slate-400 font-bold uppercase text-[10px]">Delivery Recipient</span>
              <div className="font-bold text-slate-900 text-sm">{order.shippingName}</div>
              <div className="text-slate-600 flex items-center gap-1">
                <Phone size={13} className="text-slate-400" />
                <span>{order.shippingPhone}</span>
              </div>
            </div>

            <div className="space-y-1">
              <span className="text-slate-400 font-bold uppercase text-[10px]">Shipping Address</span>
              <div className="text-slate-800 flex items-start gap-1 font-medium">
                <MapPin size={13} className="text-emerald-600 shrink-0 mt-0.5" />
                <span>{order.shippingAddress}, {order.shippingDist}, {order.shippingDiv}</span>
              </div>
              <div className="text-[11px] text-slate-500 pt-1">
                Payment: <strong>{order.paymentMethod}</strong> ({order.paymentStatus})
              </div>
            </div>
          </div>

          {/* Ordered Items List */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">Items in this Package</h4>
            <div className="divide-y divide-slate-100 border border-slate-100 rounded-2xl p-4">
              {order.items?.map((item: any) => (
                <div key={item.id} className="py-3 first:pt-0 last:pb-0 flex items-center gap-4 text-xs">
                  {item.thumbnail && (
                    <img
                      src={item.thumbnail}
                      alt={item.productName}
                      className="w-12 h-12 rounded-xl object-cover border border-slate-100 shrink-0"
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-slate-800 line-clamp-1">{item.productName}</div>
                    <div className="text-slate-400 text-[11px]">
                      Qty: {item.quantity} × {formatPrice(item.unitPrice)} {item.variantName ? `(${item.variantName})` : ''}
                    </div>
                  </div>
                  <div className="font-extrabold text-slate-900 shrink-0 text-sm">
                    {formatPrice(item.total)}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Financial Breakdown */}
          <div className="space-y-2 text-xs text-slate-600 pt-3 border-t border-slate-100">
            <div className="flex justify-between">
              <span>Items Subtotal</span>
              <span className="font-bold text-slate-900">{formatPrice(order.subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span>Delivery Charge</span>
              <span className="font-bold text-slate-900">
                {order.deliveryCharge === 0 ? <span className="text-emerald-600 font-bold uppercase text-[11px]">Free</span> : formatPrice(order.deliveryCharge)}
              </span>
            </div>
            {order.couponDiscount > 0 && (
              <div className="flex justify-between text-emerald-600 font-semibold">
                <span>Coupon Discount</span>
                <span>-{formatPrice(order.couponDiscount)}</span>
              </div>
            )}
            <div className="flex justify-between text-base font-extrabold text-slate-900 pt-3 border-t border-slate-100">
              <span>Total Payable Amount</span>
              <span className="text-emerald-700 text-lg">{formatPrice(order.total)}</span>
            </div>
          </div>
        </div>
      ) : null}

      {/* 3. Action Buttons & Customer Support */}
      <div className="flex flex-col sm:flex-row gap-3 pt-2">
        <Link
          href={`/track-order?order=${orderNumber}&phone=${phone}`}
          className="btn btn-primary btn-lg flex-1 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-700/20"
        >
          <Truck size={16} />
          <span>Track Delivery Live</span>
        </Link>

        <Link
          href="/shop"
          className="btn btn-outline btn-lg flex-1 rounded-2xl font-bold text-sm flex items-center justify-center gap-2"
        >
          <ShoppingBag size={16} />
          <span>Continue Shopping</span>
        </Link>
      </div>

      {/* WhatsApp Help CTA */}
      <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100 flex items-center justify-between gap-4 text-xs text-emerald-900">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0">
            <MessageCircle size={20} />
          </div>
          <div>
            <div className="font-bold">Need quick help with your order?</div>
            <div className="text-emerald-700 text-[11px]">Our team is available 24/7 on WhatsApp for any assistance.</div>
          </div>
        </div>

        <a
          href={`https://wa.me/8801700000000?text=Hello, I need assistance with my Order ${orderNumber}`}
          target="_blank"
          rel="noopener noreferrer"
          className="btn bg-emerald-600 hover:bg-emerald-700 text-white btn-sm rounded-xl font-bold text-xs shrink-0"
        >
          Chat Now
        </a>
      </div>
    </div>
  )
}
