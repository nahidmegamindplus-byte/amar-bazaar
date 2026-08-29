'use client'
import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import {
  AlertTriangle, Phone, MessageSquare, CheckCircle2, Clock,
  RefreshCw, Search, Filter, ArrowRight, UserCheck, XCircle,
  ExternalLink, FileText, ShoppingCart, DollarSign, TrendingUp,
  Trash2, ShieldCheck, MapPin, Eye, Check
} from 'lucide-react'
import { formatPrice, formatDateTime } from '@/lib/utils'
import toast from 'react-hot-toast'

interface IncompleteOrder {
  id: string
  sessionId?: string
  userId?: string
  customerName?: string
  phone?: string
  email?: string
  division?: string
  district?: string
  area?: string
  address?: string
  deliveryNote?: string
  paymentMethod?: string
  subtotal: number
  deliveryCharge: number
  discount: number
  total: number
  parsedItems: any[]
  status: 'NOT_CONTACTED' | 'CONTACTED' | 'RECOVERED' | 'CANCELLED'
  adminNote?: string
  convertedOrderId?: string
  lastStep: string
  createdAt: string
  updatedAt: string
}

export default function IncompleteOrdersPage() {
  const [orders, setOrders] = useState<IncompleteOrder[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [search, setSearch] = useState('')
  const [stats, setStats] = useState({
    totalAll: 0,
    notContactedCount: 0,
    contactedCount: 0,
    recoveredCount: 0,
    cancelledCount: 0,
    potentialLostRevenue: 0,
    recoveredRevenue: 0,
    recoveryRate: 0,
  })

  // Modal states
  const [noteModalOrder, setNoteModalOrder] = useState<IncompleteOrder | null>(null)
  const [noteText, setNoteText] = useState('')
  const [savingNote, setSavingNote] = useState(false)

  const [convertModalOrder, setConvertModalOrder] = useState<IncompleteOrder | null>(null)
  const [converting, setConverting] = useState(false)

  const [selectedItemsOrder, setSelectedItemsOrder] = useState<IncompleteOrder | null>(null)

  const fetchIncompleteOrders = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (statusFilter !== 'ALL') params.set('status', statusFilter)
      if (search) params.set('search', search)

      const res = await fetch(`/api/admin/incomplete-orders?${params.toString()}`)
      const data = await res.json()
      if (data.success) {
        setOrders(data.data)
        if (data.stats) setStats(data.stats)
      }
    } catch {
      toast.error('Failed to load incomplete orders')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchIncompleteOrders()
  }, [statusFilter, search])

  const handleUpdateStatus = async (id: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/admin/incomplete-orders/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      })
      if (res.ok) {
        toast.success(`Status updated to ${newStatus}`)
        setOrders((prev) =>
          prev.map((o) => (o.id === id ? { ...o, status: newStatus as any } : o))
        )
        fetchIncompleteOrders()
      } else {
        toast.error('Failed to update status')
      }
    } catch {
      toast.error('Error updating status')
    }
  }

  const handleSaveNote = async () => {
    if (!noteModalOrder) return
    setSavingNote(true)
    try {
      const res = await fetch(`/api/admin/incomplete-orders/${noteModalOrder.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ adminNote: noteText }),
      })
      if (res.ok) {
        toast.success('Admin note saved')
        setOrders((prev) =>
          prev.map((o) => (o.id === noteModalOrder.id ? { ...o, adminNote: noteText } : o))
        )
        setNoteModalOrder(null)
      } else {
        toast.error('Failed to save note')
      }
    } catch {
      toast.error('Error saving note')
    } finally {
      setSavingNote(false)
    }
  }

  const handleConvertToRealOrder = async () => {
    if (!convertModalOrder) return
    setConverting(true)
    try {
      const res = await fetch(`/api/admin/incomplete-orders/${convertModalOrder.id}/convert`, {
        method: 'POST',
      })
      const data = await res.json()
      if (res.ok && data.success) {
        toast.success(`🎉 Converted to Order #${data.data.orderNumber}!`)
        setConvertModalOrder(null)
        fetchIncompleteOrders()
      } else {
        toast.error(data.error || 'Failed to convert order')
      }
    } catch {
      toast.error('Error converting to order')
    } finally {
      setConverting(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this incomplete order record?')) return
    try {
      const res = await fetch(`/api/admin/incomplete-orders/${id}`, {
        method: 'DELETE',
      })
      if (res.ok) {
        toast.success('Incomplete order deleted')
        setOrders((prev) => prev.filter((o) => o.id !== id))
        fetchIncompleteOrders()
      } else {
        toast.error('Failed to delete')
      }
    } catch {
      toast.error('Error deleting record')
    }
  }

  const getWhatsAppLink = (order: IncompleteOrder) => {
    if (!order.phone) return '#'
    // Clean phone number (format +880...)
    let p = order.phone.replace(/[^0-9]/g, '')
    if (p.startsWith('0')) p = '88' + p
    else if (!p.startsWith('880')) p = '880' + p

    const itemsSummary = order.parsedItems
      ?.map((it: any) => `${it.productName || 'Item'} (Qty: ${it.quantity || 1})`)
      .join(', ') || 'কিছু আইটেম'

    const greeting = `আসসালামু আলাইকুম ${order.customerName || 'গ্রাহক'}, ShuddhoBazar থেকে যোগাযোগ করছি। আপনি আমাদের ওয়েবসাইটে ${itemsSummary} কার্টে যুক্ত করে চেকআউট সম্পন্ন করতে পারেননি। আপনার অর্ডারে কোনো সমস্যা বা সাহায্য প্রয়োজন হলে আমাদের জানাতে পারেন। ধন্যবাদ!`

    return `https://wa.me/${p}?text=${encodeURIComponent(greeting)}`
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'NOT_CONTACTED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-200">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
            Not Contacted
          </span>
        )
      case 'CONTACTED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-800 border border-blue-200">
            <Clock size={11} />
            Contacted
          </span>
        )
      case 'RECOVERED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
            <CheckCircle2 size={11} />
            Recovered / Order Placed
          </span>
        )
      case 'CANCELLED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-600 border border-slate-200">
            <XCircle size={11} />
            Cancelled / Not Interested
          </span>
        )
      default:
        return null
    }
  }

  const getTimeAgo = (dateStr: string) => {
    const diffMs = Date.now() - new Date(dateStr).getTime()
    const mins = Math.floor(diffMs / 60000)
    if (mins < 1) return 'Just now'
    if (mins < 60) return `${mins}m ago`
    const hours = Math.floor(mins / 60)
    if (hours < 24) return `${hours}h ago`
    const days = Math.floor(hours / 24)
    return `${days}d ago`
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-amber-500/10 text-amber-600 rounded-xl">
              <AlertTriangle size={22} />
            </div>
            <div>
              <h1 className="text-2xl font-extrabold text-slate-900">Incomplete Orders Tracker</h1>
              <p className="text-xs text-slate-500 mt-0.5">
                চেকআউটে নাম ও নম্বর দিয়ে অর্ডার অসম্পূর্ণ রেখে যাওয়া কাস্টমারদের ট্র্যাক ও রিকভার করুন
              </p>
            </div>
          </div>
        </div>
        <button
          onClick={fetchIncompleteOrders}
          className="btn btn-outline btn-sm self-start flex items-center gap-1.5"
        >
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          <span>Refresh</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card p-5 bg-gradient-to-br from-amber-500/5 to-amber-500/15 border-amber-200/60 flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-amber-800 uppercase tracking-wider">Pending Leads</p>
            <h3 className="text-2xl font-extrabold text-amber-950 mt-1">{stats.notContactedCount}</h3>
            <p className="text-[11px] text-amber-700 mt-1 font-medium">Needs immediate call/SMS</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-700 flex items-center justify-center font-black">
            <Phone size={22} />
          </div>
        </div>

        <div className="card p-5 bg-gradient-to-br from-blue-500/5 to-blue-500/15 border-blue-200/60 flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-blue-800 uppercase tracking-wider">In Discussion</p>
            <h3 className="text-2xl font-extrabold text-blue-950 mt-1">{stats.contactedCount}</h3>
            <p className="text-[11px] text-blue-700 mt-1 font-medium">Customer contacted</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-blue-500/20 text-blue-700 flex items-center justify-center font-black">
            <MessageSquare size={22} />
          </div>
        </div>

        <div className="card p-5 bg-gradient-to-br from-emerald-500/5 to-emerald-500/15 border-emerald-200/60 flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-emerald-800 uppercase tracking-wider">Recovered Sales</p>
            <h3 className="text-2xl font-extrabold text-emerald-950 mt-1">{stats.recoveredCount}</h3>
            <p className="text-[11px] text-emerald-700 mt-1 font-medium">
              Conversion Rate: <span className="font-bold">{stats.recoveryRate}%</span>
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-700 flex items-center justify-center font-black">
            <TrendingUp size={22} />
          </div>
        </div>

        <div className="card p-5 bg-gradient-to-br from-rose-500/5 to-rose-500/15 border-rose-200/60 flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-rose-800 uppercase tracking-wider">Potential Lost Value</p>
            <h3 className="text-2xl font-extrabold text-rose-950 mt-1">{formatPrice(stats.potentialLostRevenue)}</h3>
            <p className="text-[11px] text-rose-700 mt-1 font-medium">Total unrecovered cart value</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-rose-500/20 text-rose-700 flex items-center justify-center font-black">
            <DollarSign size={22} />
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="card p-4 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Status Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            {[
              { label: 'All Leads', value: 'ALL', count: stats.totalAll },
              { label: 'Pending', value: 'NOT_CONTACTED', count: stats.notContactedCount },
              { label: 'Contacted', value: 'CONTACTED', count: stats.contactedCount },
              { label: 'Recovered', value: 'RECOVERED', count: stats.recoveredCount },
              { label: 'Cancelled', value: 'CANCELLED', count: stats.cancelledCount },
            ].map((tab) => (
              <button
                key={tab.value}
                onClick={() => setStatusFilter(tab.value)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                  statusFilter === tab.value
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                <span>{tab.label}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                    statusFilter === tab.value
                      ? 'bg-white/25 text-white'
                      : 'bg-slate-200 text-slate-700'
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            ))}
          </div>

          {/* Search */}
          <div className="relative min-w-[240px] flex-1 sm:flex-initial">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by Phone, Name or Address..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input text-xs py-1.5 pl-8 rounded-xl w-full"
            />
          </div>
        </div>
      </div>

      {/* Orders List / Table */}
      <div className="card overflow-hidden">
        {loading ? (
          <div className="py-20 text-center text-slate-400">
            <div className="animate-spin text-2xl mb-2">⏳</div>
            <p className="text-xs">Loading incomplete orders...</p>
          </div>
        ) : orders.length === 0 ? (
          <div className="py-20 text-center text-slate-400 space-y-2">
            <ShoppingCart size={32} className="mx-auto text-slate-300" />
            <p className="text-sm font-bold text-slate-600">No Incomplete Orders Found</p>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              {search || statusFilter !== 'ALL'
                ? 'No abandoned checkouts match your search or filter.'
                : 'Great news! All visitors who started checkout completed their purchases.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[10px]">
                  <th className="p-3.5">Customer & Phone</th>
                  <th className="p-3.5">Location</th>
                  <th className="p-3.5">Cart Items</th>
                  <th className="p-3.5">Value</th>
                  <th className="p-3.5">Drop-off Stage</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5">Quick Actions</th>
                  <th className="p-3.5 text-right">Convert / Note</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {orders.map((order) => {
                  const hasPhone = Boolean(order.phone && order.phone.length >= 6)
                  return (
                    <tr key={order.id} className="hover:bg-slate-50/70 transition-colors">
                      {/* Customer info */}
                      <td className="p-3.5">
                        <div className="font-bold text-slate-900 text-sm">
                          {order.customerName || <span className="text-slate-400 italic">Name not provided</span>}
                        </div>
                        {order.phone ? (
                          <div className="font-mono text-emerald-700 font-bold text-xs mt-0.5 flex items-center gap-1">
                            <Phone size={11} />
                            <span>{order.phone}</span>
                          </div>
                        ) : (
                          <div className="text-slate-400 text-[11px] italic">No phone entered</div>
                        )}
                        {order.email && (
                          <div className="text-slate-400 text-[11px] truncate max-w-[150px]">{order.email}</div>
                        )}
                      </td>

                      {/* Location */}
                      <td className="p-3.5 max-w-[160px]">
                        <div className="flex items-start gap-1 text-slate-700">
                          <MapPin size={12} className="text-slate-400 mt-0.5 shrink-0" />
                          <div>
                            <div className="font-semibold text-xs text-slate-800">
                              {order.district || order.division || 'Unknown Location'}
                            </div>
                            <div className="text-[11px] text-slate-500 line-clamp-2 mt-0.5">
                              {order.address || <span className="italic text-slate-400">Address not filled</span>}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Cart Items */}
                      <td className="p-3.5">
                        <div className="flex items-center gap-2">
                          <div className="flex -space-x-2 overflow-hidden">
                            {order.parsedItems?.slice(0, 3).map((it: any, idx: number) => (
                              <div
                                key={idx}
                                className="w-8 h-8 rounded-lg bg-slate-100 border border-white overflow-hidden shrink-0 relative"
                                title={it.productName}
                              >
                                {it.thumbnail ? (
                                  <Image src={it.thumbnail} alt={it.productName || 'img'} fill className="object-cover" />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center text-[10px] font-bold text-slate-400">
                                    📦
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                          <div>
                            <span className="font-bold text-slate-800">{order.parsedItems?.length || 0} items</span>
                            <button
                              onClick={() => setSelectedItemsOrder(order)}
                              className="text-[11px] text-emerald-600 hover:underline block font-medium"
                            >
                              View details
                            </button>
                          </div>
                        </div>
                      </td>

                      {/* Value */}
                      <td className="p-3.5">
                        <div className="font-bold text-slate-900 text-sm">
                          {formatPrice(order.total || order.subtotal)}
                        </div>
                        {order.deliveryCharge > 0 && (
                          <div className="text-[10px] text-slate-400">+ Delivery: {formatPrice(order.deliveryCharge)}</div>
                        )}
                      </td>

                      {/* Drop-off Stage */}
                      <td className="p-3.5">
                        <div className="text-[11px] font-semibold text-slate-700">
                          {order.lastStep === 'ADDRESS_ENTERED' && '📍 Address Filled'}
                          {order.lastStep === 'PHONE_ENTERED' && '📱 Phone Entered'}
                          {order.lastStep === 'NAME_ENTERED' && '👤 Name Entered'}
                          {order.lastStep === 'CHECKOUT_PAGE' && '🛒 Checkout Page'}
                          {order.lastStep === 'CART_ITEMS_VIEWED' && '👀 Cart Viewed'}
                        </div>
                        <div className="text-[10px] text-slate-400 mt-0.5">
                          {getTimeAgo(order.updatedAt || order.createdAt)}
                        </div>
                      </td>

                      {/* Status */}
                      <td className="p-3.5">
                        <div className="space-y-1.5">
                          {getStatusBadge(order.status)}
                          <div>
                            <select
                              value={order.status}
                              onChange={(e) => handleUpdateStatus(order.id, e.target.value)}
                              className="text-[10px] font-bold py-0.5 px-1.5 rounded-lg border border-slate-200 bg-white text-slate-700 cursor-pointer"
                            >
                              <option value="NOT_CONTACTED">Not Contacted</option>
                              <option value="CONTACTED">Contacted</option>
                              <option value="RECOVERED">Recovered</option>
                              <option value="CANCELLED">Cancelled</option>
                            </select>
                          </div>
                        </div>
                      </td>

                      {/* Quick Communication Actions */}
                      <td className="p-3.5">
                        <div className="flex items-center gap-1.5">
                          {hasPhone ? (
                            <>
                              {/* Direct Call */}
                              <a
                                href={`tel:${order.phone}`}
                                onClick={() => {
                                  if (order.status === 'NOT_CONTACTED') handleUpdateStatus(order.id, 'CONTACTED')
                                }}
                                className="p-1.5 rounded-xl bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition-colors border border-emerald-200 flex items-center gap-1 text-[11px] font-bold px-2"
                                title="Direct Phone Call"
                              >
                                <Phone size={12} />
                                <span>Call</span>
                              </a>

                              {/* WhatsApp Chat */}
                              <a
                                href={getWhatsAppLink(order)}
                                target="_blank"
                                rel="noreferrer"
                                onClick={() => {
                                  if (order.status === 'NOT_CONTACTED') handleUpdateStatus(order.id, 'CONTACTED')
                                }}
                                className="p-1.5 rounded-xl bg-green-500 text-white hover:bg-green-600 transition-colors flex items-center gap-1 text-[11px] font-bold px-2 shadow-xs"
                                title="Send WhatsApp Recovery Message"
                              >
                                <MessageSquare size={12} />
                                <span>WhatsApp</span>
                              </a>
                            </>
                          ) : (
                            <span className="text-[10px] text-slate-400 italic">No phone number</span>
                          )}
                        </div>
                      </td>

                      {/* Convert & Notes */}
                      <td className="p-3.5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Note Button */}
                          <button
                            onClick={() => {
                              setNoteModalOrder(order)
                              setNoteText(order.adminNote || '')
                            }}
                            className={`p-1.5 rounded-xl border text-[11px] font-bold flex items-center gap-1 px-2 ${
                              order.adminNote
                                ? 'bg-amber-50 text-amber-800 border-amber-200'
                                : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                            }`}
                            title="Add or view admin follow-up notes"
                          >
                            <FileText size={12} />
                            <span>{order.adminNote ? 'Note ✓' : 'Note'}</span>
                          </button>

                          {/* 1-Click Convert */}
                          {order.status !== 'RECOVERED' && !order.convertedOrderId ? (
                            <button
                              onClick={() => setConvertModalOrder(order)}
                              disabled={!order.parsedItems || order.parsedItems.length === 0}
                              className="btn btn-primary btn-sm text-[11px] py-1 px-2.5 rounded-xl font-bold flex items-center gap-1"
                              title="Convert directly to confirmed real order"
                            >
                              <CheckCircle2 size={12} />
                              <span>Convert</span>
                            </button>
                          ) : (
                            <span className="text-[11px] font-bold text-emerald-600 flex items-center gap-1 bg-emerald-50 px-2 py-1 rounded-xl border border-emerald-100">
                              <ShieldCheck size={12} />
                              <span>Recovered</span>
                            </span>
                          )}

                          {/* Delete */}
                          <button
                            onClick={() => handleDelete(order.id)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 transition-colors"
                            title="Delete"
                          >
                            <Trash2 size={13} />
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

      {/* Note Edit Modal */}
      {noteModalOrder && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
                <FileText size={18} className="text-emerald-600" />
                <span>Admin Follow-up Note</span>
              </h3>
              <button onClick={() => setNoteModalOrder(null)} className="text-slate-400 hover:text-slate-600">
                <XCircle size={18} />
              </button>
            </div>

            <div>
              <p className="text-xs text-slate-500 mb-1">
                Customer: <span className="font-bold text-slate-800">{noteModalOrder.customerName || 'Guest'}</span> ({noteModalOrder.phone || 'No phone'})
              </p>
              <textarea
                rows={4}
                value={noteText}
                onChange={(e) => setNoteText(e.target.value)}
                placeholder="e.g. Called customer at 2 PM. Wants 5% discount or delivery on Friday..."
                className="textarea w-full text-xs rounded-xl p-3"
              />
            </div>

            <div className="flex justify-end gap-2">
              <button onClick={() => setNoteModalOrder(null)} className="btn btn-outline btn-sm rounded-xl">
                Cancel
              </button>
              <button
                onClick={handleSaveNote}
                disabled={savingNote}
                className="btn btn-primary btn-sm rounded-xl font-bold"
              >
                {savingNote ? 'Saving...' : 'Save Note'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Convert to Real Order Modal */}
      {convertModalOrder && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-6 max-w-lg w-full shadow-2xl space-y-5">
            <div className="flex items-center justify-between">
              <h3 className="font-extrabold text-slate-900 text-lg flex items-center gap-2">
                <CheckCircle2 size={20} className="text-emerald-600" />
                <span>Convert to Real Order</span>
              </h3>
              <button onClick={() => setConvertModalOrder(null)} className="text-slate-400 hover:text-slate-600">
                <XCircle size={20} />
              </button>
            </div>

            <div className="bg-slate-50 p-4 rounded-2xl space-y-2 border border-slate-100 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500 font-medium">Customer:</span>
                <span className="font-bold text-slate-900">{convertModalOrder.customerName || 'Customer'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-medium">Phone:</span>
                <span className="font-mono font-bold text-emerald-700">{convertModalOrder.phone || '01700000000'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-medium">Address:</span>
                <span className="text-slate-800 text-right max-w-[240px]">
                  {convertModalOrder.address || 'Address provided during confirmation'}
                </span>
              </div>
              <div className="flex justify-between border-t border-slate-200 pt-2">
                <span className="text-slate-500 font-medium">Items Count:</span>
                <span className="font-bold text-slate-900">{convertModalOrder.parsedItems?.length || 0} items</span>
              </div>
              <div className="flex justify-between font-bold text-sm text-emerald-700 pt-1">
                <span>Total Amount:</span>
                <span>{formatPrice(convertModalOrder.total || convertModalOrder.subtotal)}</span>
              </div>
            </div>

            <p className="text-xs text-slate-500">
              This will create an active order with a generated order number in the system, mark the lead as <span className="font-bold text-emerald-600">RECOVERED</span>, and add it to your Orders management list.
            </p>

            <div className="flex justify-end gap-2 pt-2">
              <button onClick={() => setConvertModalOrder(null)} className="btn btn-outline btn-sm rounded-xl">
                Cancel
              </button>
              <button
                onClick={handleConvertToRealOrder}
                disabled={converting}
                className="btn btn-primary btn-sm rounded-xl font-bold flex items-center gap-1.5"
              >
                {converting ? (
                  <span>Converting...</span>
                ) : (
                  <>
                    <Check size={14} />
                    <span>Confirm & Create Order</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Cart Items Details Modal */}
      {selectedItemsOrder && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-6 max-w-lg w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
                <ShoppingCart size={18} className="text-emerald-600" />
                <span>Abandoned Cart Items</span>
              </h3>
              <button onClick={() => setSelectedItemsOrder(null)} className="text-slate-400 hover:text-slate-600">
                <XCircle size={18} />
              </button>
            </div>

            <div className="divide-y divide-slate-100 max-h-[300px] overflow-y-auto pr-1">
              {selectedItemsOrder.parsedItems?.map((it: any, idx: number) => (
                <div key={idx} className="py-3 flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-slate-100 relative overflow-hidden shrink-0 border border-slate-100">
                    {it.thumbnail ? (
                      <Image src={it.thumbnail} alt={it.productName || 'product'} fill className="object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-xs">📦</div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-slate-900 text-xs truncate">{it.productName}</div>
                    {it.variantName && (
                      <div className="text-[10px] text-slate-400">Variant: {it.variantName}</div>
                    )}
                    <div className="text-[11px] text-slate-500 mt-0.5">
                      Qty: <span className="font-bold text-slate-700">{it.quantity || 1}</span> × {formatPrice(it.salePrice || it.unitPrice || it.price || 0)}
                    </div>
                  </div>
                  <div className="font-bold text-slate-900 text-xs">
                    {formatPrice((it.salePrice || it.unitPrice || it.price || 0) * (it.quantity || 1))}
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t border-slate-100 pt-3 flex justify-between items-center font-bold text-sm">
              <span className="text-slate-700">Subtotal:</span>
              <span className="text-emerald-700">{formatPrice(selectedItemsOrder.subtotal || selectedItemsOrder.total)}</span>
            </div>

            <div className="flex justify-end pt-2">
              <button onClick={() => setSelectedItemsOrder(null)} className="btn btn-outline btn-sm rounded-xl">
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
