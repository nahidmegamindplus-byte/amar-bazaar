'use client'
import { useState, useEffect } from 'react'
import {
  ShoppingBag, Search, Filter, Eye, CheckCircle2, Clock,
  Truck, XCircle, RefreshCw, ChevronDown, Download
} from 'lucide-react'
import { formatPrice, formatDate, formatDateTime } from '@/lib/utils'
import toast from 'react-hot-toast'

const STATUS_OPTIONS = [
  'PENDING', 'CONFIRMED', 'PROCESSING', 'PACKED', 'SHIPPED', 'OUT_FOR_DELIVERY', 'DELIVERED', 'CANCELLED'
]

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('')
  const [search, setSearch] = useState('')
  const [selectedOrder, setSelectedOrder] = useState<any>(null)
  const [updating, setUpdating] = useState(false)

  const fetchOrders = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (statusFilter) params.set('status', statusFilter)
      if (search) params.set('search', search)

      const res = await fetch(`/api/admin/orders?${params.toString()}`)
      const data = await res.json()
      if (data.success) {
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
  }, [statusFilter, search])

  const handleUpdateStatus = async (orderId: string, newStatus: string) => {
    setUpdating(true)
    try {
      const res = await fetch('/api/admin/orders', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId, status: newStatus }),
      })
      if (res.ok) {
        toast.success(`Order status updated to ${newStatus}`)
        fetchOrders()
        if (selectedOrder && selectedOrder.id === orderId) {
          setSelectedOrder((prev: any) => ({ ...prev, status: newStatus }))
        }
      } else {
        toast.error('Status update failed')
      }
    } catch {
      toast.error('Error updating order')
    } finally {
      setUpdating(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">Orders Management</h1>
          <p className="text-xs text-slate-500 mt-1">Track and manage customer orders and fulfillment status</p>
        </div>
        <button onClick={fetchOrders} className="btn btn-outline btn-sm self-start flex items-center gap-1.5">
          <RefreshCw size={14} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Filter Toolbar */}
      <div className="card p-4 flex flex-wrap gap-3 items-center justify-between">
        <div className="flex flex-wrap gap-3 items-center flex-1">
          {/* Search */}
          <div className="relative min-w-[220px]">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by Order # or Name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input text-xs py-1.5 pl-8 rounded-xl"
            />
          </div>

          {/* Status filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="select text-xs py-1.5 px-3 rounded-xl bg-white border-slate-200"
          >
            <option value="">All Statuses</option>
            {STATUS_OPTIONS.map((st) => (
              <option key={st} value={st}>{st}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Orders Table */}
      <div className="card overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-400">Loading orders...</div>
        ) : orders.length === 0 ? (
          <div className="p-12 text-center space-y-2">
            <ShoppingBag size={36} className="mx-auto text-slate-300" />
            <h3 className="font-bold text-sm text-slate-800">No Orders Found</h3>
            <p className="text-xs text-slate-500">Orders placed by customers will appear here.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Order Number</th>
                  <th>Customer</th>
                  <th>Location</th>
                  <th>Items</th>
                  <th>Total</th>
                  <th>Payment</th>
                  <th>Status</th>
                  <th>Date</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order.id}>
                    <td className="font-bold text-slate-900">{order.orderNumber}</td>
                    <td>
                      <div className="font-semibold text-slate-800">{order.shippingName}</div>
                      <div className="text-[11px] text-slate-400">{order.shippingPhone}</div>
                    </td>
                    <td className="text-xs text-slate-600">
                      {order.shippingDist}, {order.shippingDiv}
                    </td>
                    <td className="text-xs text-slate-600 font-semibold">
                      {order.items?.length || 1} items
                    </td>
                    <td className="font-extrabold text-emerald-700">
                      {formatPrice(order.total)}
                    </td>
                    <td className="text-xs">
                      <span className="badge badge-gray">{order.paymentMethod}</span>
                    </td>
                    <td>
                      <select
                        value={order.status}
                        onChange={(e) => handleUpdateStatus(order.id, e.target.value)}
                        disabled={updating}
                        className="text-xs font-bold py-1 px-2 rounded-lg border border-slate-200 bg-white"
                      >
                        {STATUS_OPTIONS.map((st) => (
                          <option key={st} value={st}>{st}</option>
                        ))}
                      </select>
                    </td>
                    <td className="text-xs text-slate-500">{formatDate(order.createdAt)}</td>
                    <td>
                      <button
                        onClick={() => setSelectedOrder(order)}
                        className="btn btn-ghost btn-sm p-1 text-slate-600 hover:text-emerald-700"
                        title="View Details"
                      >
                        <Eye size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Order Details Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 md:p-8 max-w-lg w-full max-h-[90vh] overflow-y-auto space-y-6 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="font-extrabold text-base text-slate-900">Order #{selectedOrder.orderNumber}</h3>
                <span className="text-xs text-slate-400">Placed on {formatDateTime(selectedOrder.createdAt)}</span>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="p-1 text-slate-400 hover:text-slate-700 font-bold"
              >
                ✕
              </button>
            </div>

            {/* Customer & Address */}
            <div className="space-y-2 text-xs bg-slate-50 p-4 rounded-2xl border border-slate-100">
              <div className="font-bold text-slate-800 text-sm">{selectedOrder.shippingName}</div>
              <div className="text-slate-600">📞 {selectedOrder.shippingPhone}</div>
              <div className="text-slate-600">📍 {selectedOrder.shippingAddress}, {selectedOrder.shippingDist}, {selectedOrder.shippingDiv}</div>
              {selectedOrder.deliveryNote && (
                <div className="text-amber-700 pt-1">📝 Note: {selectedOrder.deliveryNote}</div>
              )}
            </div>

            {/* Items list */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">Ordered Items</h4>
              <div className="divide-y divide-slate-100 border border-slate-100 rounded-2xl p-3 max-h-48 overflow-y-auto">
                {selectedOrder.items?.map((item: any) => (
                  <div key={item.id} className="py-2 first:pt-0 last:pb-0 flex items-center justify-between text-xs">
                    <div>
                      <div className="font-semibold text-slate-800">{item.productName}</div>
                      <div className="text-slate-400 text-[11px]">Qty: {item.quantity} × {formatPrice(item.unitPrice)}</div>
                    </div>
                    <div className="font-bold text-slate-900">{formatPrice(item.total)}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Cost breakdown */}
            <div className="space-y-1.5 text-xs text-slate-600 pt-2 border-t border-slate-100">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>{formatPrice(selectedOrder.subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span>Delivery Charge</span>
                <span>{formatPrice(selectedOrder.deliveryCharge)}</span>
              </div>
              {selectedOrder.discount > 0 && (
                <div className="flex justify-between text-emerald-600">
                  <span>Discount</span>
                  <span>-{formatPrice(selectedOrder.discount)}</span>
                </div>
              )}
              <div className="flex justify-between text-sm font-extrabold text-slate-900 pt-2 border-t border-slate-100">
                <span>Total</span>
                <span className="text-emerald-700">{formatPrice(selectedOrder.total)}</span>
              </div>
            </div>

            <button
              onClick={() => setSelectedOrder(null)}
              className="btn btn-primary w-full rounded-xl font-bold text-xs"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
