'use client'
import { useState, useEffect, useRef } from 'react'
import {
  ShoppingBag, Search, Filter, Eye, CheckCircle2, Clock,
  Truck, XCircle, RefreshCw, ChevronDown, Download, Printer,
  Phone, MapPin, Copy, MessageCircle, ArrowRight, Check, X,
  Package, DollarSign, Calendar, AlertCircle, Sparkles, Send
} from 'lucide-react'
import { formatPrice, formatDate, formatDateTime } from '@/lib/utils'
import toast from 'react-hot-toast'

const STATUS_CONFIG: Record<string, { label: string; badge: string; color: string }> = {
  PENDING: { label: 'Pending', badge: 'bg-orange-50 text-orange-700 border-orange-200', color: '#f97316' },
  CONFIRMED: { label: 'Confirmed', badge: 'bg-blue-50 text-blue-700 border-blue-200', color: '#3b82f6' },
  PROCESSING: { label: 'Processing', badge: 'bg-purple-50 text-purple-700 border-purple-200', color: '#8b5cf6' },
  PACKED: { label: 'Packed', badge: 'bg-cyan-50 text-cyan-700 border-cyan-200', color: '#06b6d4' },
  SHIPPED: { label: 'Shipped', badge: 'bg-indigo-50 text-indigo-700 border-indigo-200', color: '#6366f1' },
  OUT_FOR_DELIVERY: { label: 'Out for Delivery', badge: 'bg-amber-50 text-amber-700 border-amber-200', color: '#f59e0b' },
  DELIVERED: { label: 'Delivered', badge: 'bg-emerald-50 text-emerald-700 border-emerald-200', color: '#16a34a' },
  CANCELLED: { label: 'Cancelled', badge: 'bg-rose-50 text-rose-700 border-rose-200', color: '#ef4444' },
  RETURNED: { label: 'Returned', badge: 'bg-slate-100 text-slate-700 border-slate-200', color: '#64748b' },
}

const ALL_STATUSES = [
  'PENDING', 'CONFIRMED', 'PROCESSING', 'PACKED', 'SHIPPED', 'OUT_FOR_DELIVERY', 'DELIVERED', 'CANCELLED'
]

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<string>('ALL')
  const [search, setSearch] = useState('')
  const [paymentFilter, setPaymentFilter] = useState('')
  const [selectedOrder, setSelectedOrder] = useState<any>(null)
  const [updating, setUpdating] = useState(false)
  const [trackingInput, setTrackingInput] = useState('')
  const [adminNote, setAdminNote] = useState('')
  const invoicePrintRef = useRef<HTMLDivElement>(null)

  const fetchOrders = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (activeTab !== 'ALL') params.set('status', activeTab)
      if (search.trim()) params.set('search', search.trim())
      if (paymentFilter) params.set('payment', paymentFilter)
      params.set('limit', '50')

      const res = await fetch(`/api/admin/orders?${params.toString()}`)
      const data = await res.json()
      if (data.success && data.data) {
        setOrders(data.data)
      }
    } catch {
      toast.error('Failed to load orders')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchOrders()
  }, [activeTab, search, paymentFilter])

  const handleUpdateStatus = async (orderId: string, newStatus: string, customNote?: string) => {
    setUpdating(true)
    const toastId = toast.loading(`Updating status to ${newStatus}...`)
    try {
      const res = await fetch('/api/admin/orders', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId,
          status: newStatus,
          note: customNote || `Status updated to ${newStatus} by admin`,
          trackingNumber: trackingInput.trim() || undefined,
        }),
      })
      const d = await res.json()
      if (res.ok && d.success) {
        toast.success(`Order marked as ${newStatus}! 🎉`, { id: toastId })
        fetchOrders()
        if (selectedOrder && selectedOrder.id === orderId) {
          setSelectedOrder((prev: any) => ({
            ...prev,
            status: newStatus,
            trackingNumber: trackingInput.trim() || prev.trackingNumber,
          }))
        }
      } else {
        toast.error(d.error || 'Status update failed', { id: toastId })
      }
    } catch {
      toast.error('Error updating order status', { id: toastId })
    } finally {
      setUpdating(false)
    }
  }

  const handlePrintInvoice = () => {
    window.print()
  }

  const copyToClipboard = (text: string, label = 'Copied') => {
    navigator.clipboard.writeText(text)
    toast.success(`${label} copied!`)
  }

  // Quick stats for status tabs
  const pendingCount = orders.filter((o) => o.status === 'PENDING').length

  return (
    <div className="space-y-6 max-w-7xl">
      {/* 1. Header Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 flex items-center gap-2">
            <ShoppingBag className="text-emerald-600" size={26} />
            <span>Orders Management (অর্ডার ব্যবস্থাপনা)</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Process customer purchases, generate invoices, track couriers, and manage order fulfillment
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchOrders}
            className="btn btn-outline btn-sm rounded-xl font-bold flex items-center gap-1.5 cursor-pointer"
            title="Reload orders"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* 2. Status Filter Navigation Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 border-b border-slate-200">
        {[
          { id: 'ALL', label: 'All Orders' },
          { id: 'PENDING', label: 'Pending', countBadge: pendingCount > 0 ? pendingCount : undefined },
          { id: 'CONFIRMED', label: 'Confirmed' },
          { id: 'PROCESSING', label: 'Processing' },
          { id: 'SHIPPED', label: 'Shipped' },
          { id: 'DELIVERED', label: 'Delivered' },
          { id: 'CANCELLED', label: 'Cancelled' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer shrink-0 flex items-center gap-1.5 ${
              activeTab === tab.id
                ? 'bg-emerald-700 text-white shadow-sm'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
            }`}
          >
            <span>{tab.label}</span>
            {tab.countBadge !== undefined && (
              <span className="w-5 h-5 rounded-full bg-amber-400 text-slate-950 text-[10px] flex items-center justify-center font-extrabold">
                {tab.countBadge}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* 3. Search and Secondary Filter Controls */}
      <div className="card p-3.5 bg-white rounded-2xl border border-slate-100 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto flex-1">
          {/* Search Box */}
          <div className="relative flex-1 sm:w-80">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by Order #, Customer Name, or Phone..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input text-xs pl-9 py-2 rounded-xl bg-slate-50 border-slate-200"
            />
          </div>

          {/* Payment Method Filter */}
          <select
            value={paymentFilter}
            onChange={(e) => setPaymentFilter(e.target.value)}
            className="select text-xs py-2 rounded-xl bg-slate-50 border-slate-200 w-auto font-semibold"
          >
            <option value="">All Payment Methods</option>
            <option value="COD">Cash on Delivery (COD)</option>
            <option value="BKASH">bKash (বিকাশ)</option>
            <option value="NAGAD">Nagad (নগদ)</option>
            <option value="ROCKET">Rocket (রকেট)</option>
          </select>
        </div>

        <div className="text-xs text-slate-400 font-semibold self-end sm:self-auto">
          Showing <strong>{orders.length}</strong> orders
        </div>
      </div>

      {/* 4. Professional Orders Table */}
      <div className="card bg-white rounded-3xl border border-slate-100 shadow-xs overflow-hidden">
        {loading ? (
          <div className="py-20 text-center text-xs text-slate-400 space-y-2">
            <RefreshCw size={26} className="animate-spin mx-auto text-emerald-600" />
            <p className="font-semibold">Loading orders data...</p>
          </div>
        ) : orders.length === 0 ? (
          <div className="py-16 text-center space-y-3">
            <ShoppingBag size={44} className="mx-auto text-slate-300" />
            <h3 className="font-bold text-sm text-slate-800">No orders found</h3>
            <p className="text-xs text-slate-400">Try adjusting your status tab or search keyword.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/80 border-b border-slate-100 text-slate-400 font-bold uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="py-3 px-4">Order ID & Date</th>
                  <th className="py-3 px-4">Customer Info</th>
                  <th className="py-3 px-4">Items Summary</th>
                  <th className="py-3 px-4">Total Amount</th>
                  <th className="py-3 px-4">Payment</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {orders.map((order) => {
                  const statusInfo = STATUS_CONFIG[order.status] || { label: order.status, badge: 'bg-slate-100 text-slate-700' }
                  const totalItemsQty = order.items?.reduce((sum: number, i: any) => sum + i.quantity, 0) || 0

                  return (
                    <tr key={order.id} className="hover:bg-slate-50/70 transition-colors group">
                      {/* Order ID & Date */}
                      <td className="py-3.5 px-4 align-top">
                        <div className="flex items-center gap-1.5 font-mono font-extrabold text-slate-900 text-sm">
                          <span>{order.orderNumber}</span>
                          <button
                            onClick={() => copyToClipboard(order.orderNumber, 'Order ID')}
                            className="text-slate-300 hover:text-emerald-600 transition-colors p-0.5"
                            title="Copy Order ID"
                          >
                            <Copy size={12} />
                          </button>
                        </div>
                        <div className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                          <Clock size={11} />
                          <span>{formatDate(order.createdAt)}</span>
                        </div>
                      </td>

                      {/* Customer Info with Quick Contact Shortcuts */}
                      <td className="py-3.5 px-4 align-top max-w-[200px]">
                        <div className="font-bold text-slate-900 line-clamp-1">{order.shippingName}</div>
                        <div className="text-slate-500 font-mono text-[11px] flex items-center gap-2 mt-0.5">
                          <a
                            href={`tel:${order.shippingPhone}`}
                            className="hover:text-emerald-600 hover:underline flex items-center gap-0.5"
                            title="Call recipient"
                          >
                            <Phone size={11} className="text-slate-400" />
                            <span>{order.shippingPhone}</span>
                          </a>
                          <a
                            href={`https://wa.me/880${order.shippingPhone.replace(/^0/, '')}?text=Hello ${encodeURIComponent(order.shippingName)}, your order ${order.orderNumber} from ShuddhoBazar is being processed.`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-emerald-600 hover:text-emerald-700"
                            title="Send WhatsApp update"
                          >
                            <MessageCircle size={12} />
                          </a>
                        </div>
                        <div className="text-[10px] text-slate-400 line-clamp-1 mt-0.5" title={order.shippingAddress}>
                          <MapPin size={10} className="inline mr-0.5 text-slate-300" />
                          <span>{order.shippingAddress}, {order.shippingDist}</span>
                        </div>
                      </td>

                      {/* Items Summary Preview */}
                      <td className="py-3.5 px-4 align-top max-w-[200px]">
                        <div className="flex items-center gap-1.5">
                          {order.items?.slice(0, 2).map((item: any) => (
                            <img
                              key={item.id}
                              src={item.thumbnail || item.product?.thumbnail || 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=100&q=80'}
                              alt={item.productName}
                              className="w-8 h-8 rounded-lg object-cover border border-slate-200 shrink-0"
                              title={`${item.productName} (x${item.quantity})`}
                            />
                          ))}
                          {order.items?.length > 2 && (
                            <span className="w-8 h-8 rounded-lg bg-slate-100 text-slate-600 font-bold text-[10px] flex items-center justify-center border border-slate-200">
                              +{order.items.length - 2}
                            </span>
                          )}
                        </div>
                        <div className="text-[10px] text-slate-500 line-clamp-1 mt-1">
                          {order.items?.[0]?.productName} {order.items?.length > 1 ? `& ${order.items.length - 1} more` : ''}
                        </div>
                      </td>

                      {/* Total Amount */}
                      <td className="py-3.5 px-4 align-top">
                        <div className="font-extrabold text-sm text-slate-900">
                          {formatPrice(order.total)}
                        </div>
                        <div className="text-[10px] text-slate-400">
                          Delivery: {order.deliveryCharge === 0 ? 'Free' : formatPrice(order.deliveryCharge)}
                        </div>
                      </td>

                      {/* Payment Method Badge */}
                      <td className="py-3.5 px-4 align-top">
                        <div className="space-y-1">
                          <span className="badge badge-gray font-mono font-bold text-[10px]">
                            {order.paymentMethod}
                          </span>
                          <div className={`text-[10px] font-bold ${order.paymentStatus === 'PAID' ? 'text-emerald-600' : 'text-slate-400'}`}>
                            {order.paymentStatus === 'PAID' ? '✓ Paid' : '⏳ Pending'}
                          </div>
                        </div>
                      </td>

                      {/* Status Dropdown */}
                      <td className="py-3.5 px-4 align-top">
                        <div className="relative inline-block">
                          <select
                            value={order.status}
                            disabled={updating}
                            onChange={(e) => handleUpdateStatus(order.id, e.target.value)}
                            className={`text-[11px] font-extrabold py-1 px-2.5 rounded-full border cursor-pointer appearance-none pr-6 focus:outline-none transition-colors ${statusInfo.badge}`}
                          >
                            {ALL_STATUSES.map((st) => (
                              <option key={st} value={st}>
                                {STATUS_CONFIG[st]?.label || st}
                              </option>
                            ))}
                          </select>
                          <ChevronDown size={11} className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none opacity-60" />
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 align-top text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => {
                              setSelectedOrder(order)
                              setTrackingInput(order.trackingNumber || '')
                              setAdminNote('')
                            }}
                            className="btn btn-primary btn-sm rounded-xl py-1 px-2.5 font-bold text-xs flex items-center gap-1 shadow-xs cursor-pointer"
                            title="View Full Order & Invoice"
                          >
                            <Eye size={13} />
                            <span>Details</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 5. Professional Order Details & Printable Invoice Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-fadeIn">
          <div className="relative max-w-3xl w-full bg-white rounded-3xl shadow-2xl overflow-hidden max-h-[92vh] flex flex-col">
            {/* Modal Header */}
            <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/80">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-xs">
                  <Package size={18} />
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-slate-900 flex items-center gap-2">
                    <span>Order #{selectedOrder.orderNumber}</span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${STATUS_CONFIG[selectedOrder.status]?.badge || 'bg-slate-100 text-slate-700'}`}>
                      {STATUS_CONFIG[selectedOrder.status]?.label || selectedOrder.status}
                    </span>
                  </h3>
                  <p className="text-xs text-slate-400">Placed on {formatDateTime(selectedOrder.createdAt)}</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handlePrintInvoice}
                  className="btn btn-outline btn-sm rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                  title="Print official customer invoice"
                >
                  <Printer size={14} />
                  <span className="hidden sm:inline">Print Invoice</span>
                </button>

                <button
                  onClick={() => setSelectedOrder(null)}
                  className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Modal Printable Content Body */}
            <div ref={invoicePrintRef} className="p-5 sm:p-6 overflow-y-auto space-y-6 flex-1 text-slate-800">
              {/* Invoice Header Brand for Printing */}
              <div className="flex justify-between items-start pb-4 border-b border-slate-100">
                <div>
                  <h2 className="text-2xl font-black text-emerald-800 tracking-tight">ShuddhoBazar</h2>
                  <p className="text-xs text-slate-500 font-light">100% Pure Organic Grocery Bangladesh</p>
                  <p className="text-[11px] text-slate-400">Support: +880-1234-567890 • www.shuddhobazar.com</p>
                </div>
                <div className="text-right">
                  <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Customer Invoice</div>
                  <div className="font-mono font-bold text-slate-900 text-sm mt-0.5">{selectedOrder.orderNumber}</div>
                  <div className="text-[11px] text-slate-400">{formatDate(selectedOrder.createdAt)}</div>
                </div>
              </div>

              {/* Customer Delivery & Payment Breakdown Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50/80 p-4 rounded-2xl border border-slate-100 text-xs">
                <div className="space-y-1">
                  <span className="font-bold text-slate-400 uppercase text-[10px] tracking-wider">Recipient Details</span>
                  <div className="font-extrabold text-slate-900 text-sm">{selectedOrder.shippingName}</div>
                  <div className="text-slate-600 flex items-center gap-2 pt-0.5">
                    <span className="font-mono">{selectedOrder.shippingPhone}</span>
                    <a
                      href={`https://wa.me/880${selectedOrder.shippingPhone.replace(/^0/, '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-emerald-600 font-bold hover:underline"
                    >
                      (WhatsApp)
                    </a>
                  </div>
                  {selectedOrder.shippingEmail && (
                    <div className="text-slate-500">{selectedOrder.shippingEmail}</div>
                  )}
                </div>

                <div className="space-y-1">
                  <span className="font-bold text-slate-400 uppercase text-[10px] tracking-wider">Shipping Address</span>
                  <div className="text-slate-800 leading-relaxed font-medium">
                    {selectedOrder.shippingAddress}, {selectedOrder.shippingArea}, {selectedOrder.shippingDist}, {selectedOrder.shippingDiv}
                  </div>
                  {selectedOrder.deliveryNote && (
                    <div className="text-[11px] text-amber-800 bg-amber-50 p-1.5 rounded-lg mt-1 border border-amber-200">
                      <strong>Note:</strong> {selectedOrder.deliveryNote}
                    </div>
                  )}
                </div>
              </div>

              {/* Ordered Items Table */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">Order Items (পণ্যের বিবরণ)</h4>
                <div className="border border-slate-100 rounded-2xl overflow-hidden">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-slate-50 border-b border-slate-100 text-slate-400 font-bold uppercase text-[10px]">
                      <tr>
                        <th className="py-2.5 px-3">Item</th>
                        <th className="py-2.5 px-3 text-center">Unit Price</th>
                        <th className="py-2.5 px-3 text-center">Qty</th>
                        <th className="py-2.5 px-3 text-right">Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {selectedOrder.items?.map((item: any) => (
                        <tr key={item.id}>
                          <td className="py-3 px-3">
                            <div className="flex items-center gap-2.5">
                              {item.thumbnail && (
                                <img
                                  src={item.thumbnail}
                                  alt={item.productName}
                                  className="w-9 h-9 rounded-lg object-cover border border-slate-200 shrink-0"
                                />
                              )}
                              <div>
                                <div className="font-bold text-slate-900">{item.productName}</div>
                                {item.variantName && (
                                  <div className="text-slate-400 text-[10px]">Option: {item.variantName}</div>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="py-3 px-3 text-center font-mono">
                            {formatPrice(item.salePrice || item.unitPrice)}
                          </td>
                          <td className="py-3 px-3 text-center font-bold">
                            {item.quantity}
                          </td>
                          <td className="py-3 px-3 text-right font-extrabold text-slate-900">
                            {formatPrice(item.total)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Price Calculation Summary */}
              <div className="flex justify-end pt-2">
                <div className="w-full sm:w-72 space-y-2 text-xs text-slate-600 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span className="font-bold text-slate-900">{formatPrice(selectedOrder.subtotal)}</span>
                  </div>
                  {selectedOrder.discount > 0 && (
                    <div className="flex justify-between text-emerald-600 font-semibold">
                      <span>Product Discount:</span>
                      <span>-{formatPrice(selectedOrder.discount)}</span>
                    </div>
                  )}
                  {selectedOrder.couponDiscount > 0 && (
                    <div className="flex justify-between text-emerald-600 font-semibold">
                      <span>Coupon ({selectedOrder.couponCode}):</span>
                      <span>-{formatPrice(selectedOrder.couponDiscount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span>Delivery Fee ({selectedOrder.shippingDiv}):</span>
                    <span className="font-bold text-slate-900">
                      {selectedOrder.deliveryCharge === 0 ? 'Free' : formatPrice(selectedOrder.deliveryCharge)}
                    </span>
                  </div>
                  <div className="flex justify-between text-base font-extrabold text-slate-900 border-t border-slate-200 pt-2">
                    <span>Total Payable:</span>
                    <span className="text-emerald-700 text-lg">{formatPrice(selectedOrder.total)}</span>
                  </div>
                  <div className="text-[11px] text-slate-500 pt-1 text-center font-medium">
                    Payment Method: <strong>{selectedOrder.paymentMethod}</strong> ({selectedOrder.paymentStatus})
                  </div>
                </div>
              </div>

              {/* Order Processing / Courier Update Control Strip */}
              <div className="p-4 bg-emerald-50/60 rounded-2xl border border-emerald-200/80 space-y-3">
                <h4 className="font-extrabold text-xs text-emerald-950 uppercase tracking-wider flex items-center gap-1.5">
                  <Truck size={14} className="text-emerald-700" />
                  <span>Courier & Fulfillment Controls</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="form-label text-[11px] font-bold text-slate-700">Courier Tracking Number</label>
                    <input
                      type="text"
                      placeholder="e.g. STEADFAST-12345 / PATHAO-998"
                      value={trackingInput}
                      onChange={(e) => setTrackingInput(e.target.value)}
                      className="input text-xs rounded-xl bg-white"
                    />
                  </div>
                  <div>
                    <label className="form-label text-[11px] font-bold text-slate-700">Quick Update Status</label>
                    <div className="flex flex-wrap gap-1.5 pt-0.5">
                      {['CONFIRMED', 'SHIPPED', 'DELIVERED', 'CANCELLED'].map((st) => (
                        <button
                          key={st}
                          type="button"
                          disabled={updating || selectedOrder.status === st}
                          onClick={() => handleUpdateStatus(selectedOrder.id, st)}
                          className={`btn btn-sm rounded-lg text-[10.5px] font-bold cursor-pointer ${
                            selectedOrder.status === st
                              ? 'bg-slate-300 text-slate-600 opacity-60'
                              : st === 'DELIVERED'
                              ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                              : st === 'CANCELLED'
                              ? 'bg-rose-50 text-rose-600 hover:bg-rose-100 border border-rose-200'
                              : 'bg-white hover:bg-emerald-50 text-slate-800 border border-slate-200'
                          }`}
                        >
                          {STATUS_CONFIG[st]?.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
              <span className="text-xs text-slate-400 font-medium">ShuddhoBazar Admin Operations</span>
              <button
                onClick={() => setSelectedOrder(null)}
                className="btn btn-primary btn-sm rounded-xl text-xs font-bold px-5 cursor-pointer"
              >
                Close Window
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
