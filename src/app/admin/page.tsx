'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  ShoppingBag, TrendingUp, Users, Package, AlertTriangle,
  ArrowUpRight, ArrowDownRight, Clock, CheckCircle2, XCircle,
  Truck, BarChart3, RefreshCw, Eye, Plus, ArrowRight, DollarSign,
  Percent, CreditCard, Flame, Sparkles, ChevronRight, Phone, ShieldCheck
} from 'lucide-react'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell
} from 'recharts'
import { formatPrice, formatDateTime, formatDate } from '@/lib/utils'
import toast from 'react-hot-toast'

const STATUS_BADGE: Record<string, { bg: string; text: string; label: string }> = {
  PENDING: { bg: 'bg-orange-50 text-orange-700 border-orange-200', text: 'text-orange-700', label: 'Pending' },
  CONFIRMED: { bg: 'bg-blue-50 text-blue-700 border-blue-200', text: 'text-blue-700', label: 'Confirmed' },
  PROCESSING: { bg: 'bg-purple-50 text-purple-700 border-purple-200', text: 'text-purple-700', label: 'Processing' },
  PACKED: { bg: 'bg-cyan-50 text-cyan-700 border-cyan-200', text: 'text-cyan-700', label: 'Packed' },
  SHIPPED: { bg: 'bg-indigo-50 text-indigo-700 border-indigo-200', text: 'text-indigo-700', label: 'Shipped' },
  OUT_FOR_DELIVERY: { bg: 'bg-amber-50 text-amber-700 border-amber-200', text: 'text-amber-700', label: 'Out for Delivery' },
  DELIVERED: { bg: 'bg-emerald-50 text-emerald-700 border-emerald-200', text: 'text-emerald-700', label: 'Delivered' },
  CANCELLED: { bg: 'bg-rose-50 text-rose-700 border-rose-200', text: 'text-rose-700', label: 'Cancelled' },
}

export default function AdminDashboard() {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [timeRange, setTimeRange] = useState<'7' | '30'>('7')

  const fetchData = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/analytics')
      const json = await res.json()
      if (json.success) {
        setData(json.data)
      } else {
        toast.error('Failed to load analytics')
      }
    } catch {
      toast.error('Network error loading analytics')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[450px] gap-3 text-slate-400">
        <RefreshCw size={32} className="animate-spin text-emerald-600" />
        <p className="text-xs font-semibold">Loading real-time store analytics...</p>
      </div>
    )
  }

  const cards = data?.cards || {}
  const chartData = timeRange === '7' ? (data?.charts?.last7Days || []) : (data?.charts?.last30Days || [])
  const statusDistribution = data?.statusDistribution || []
  const paymentDistribution = data?.paymentDistribution || []
  const topProducts = data?.topProducts || []
  const recentOrders = data?.recentOrders || []

  return (
    <div className="space-y-6 max-w-7xl">
      {/* 1. Header & Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-emerald-900 via-emerald-950 to-slate-950 p-6 rounded-3xl text-white shadow-xl relative overflow-hidden">
        <div className="absolute -right-8 -bottom-8 w-48 h-48 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />
        <div className="relative z-10 space-y-1">
          <div className="inline-flex items-center gap-1.5 bg-emerald-500/20 text-emerald-300 text-[10px] font-bold px-2.5 py-0.5 rounded-full backdrop-blur-xs border border-emerald-400/20">
            <Sparkles size={11} className="text-amber-400" />
            <span>Store Operations Dashboard</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Store Analytics & Control Center</h1>
          <p className="text-xs text-slate-300">Live order tracking, revenue forecasts, and inventory management overview</p>
        </div>

        <div className="relative z-10 flex flex-wrap items-center gap-2">
          <Link
            href="/admin/products/new"
            className="btn btn-primary btn-sm rounded-xl font-bold flex items-center gap-1.5 shadow-lg shadow-emerald-700/30"
          >
            <Plus size={15} />
            <span>Add Product</span>
          </Link>
          <Link
            href="/admin/orders"
            className="btn bg-white/10 hover:bg-white/20 text-white border border-white/20 btn-sm rounded-xl font-semibold backdrop-blur-xs flex items-center gap-1.5"
          >
            <ShoppingBag size={14} />
            <span>Orders</span>
          </Link>
          <button
            onClick={fetchData}
            className="btn bg-white/10 hover:bg-white/20 text-white border border-white/20 btn-sm rounded-xl p-2"
            title="Refresh analytics data"
          >
            <RefreshCw size={14} />
          </button>
        </div>
      </div>

      {/* 2. Top Primary Metrics Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {/* Today's Sales */}
        <div className="card p-3.5 bg-white rounded-2xl border-emerald-100/80 shadow-xs flex flex-col justify-between hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Today's Sales</span>
            <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <TrendingUp size={15} />
            </div>
          </div>
          <div className="mt-2 space-y-0.5">
            <div className="text-lg sm:text-xl font-extrabold text-slate-900 leading-none">
              {formatPrice(cards.todaySales || 0)}
            </div>
            <div className="text-[10.5px] font-semibold text-emerald-600 flex items-center gap-0.5">
              <span>{cards.todayOrders || 0} order(s) today</span>
            </div>
          </div>
        </div>

        {/* This Month's Sales */}
        <div className="card p-3.5 bg-white rounded-2xl border-blue-100/80 shadow-xs flex flex-col justify-between hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Month Sales</span>
            <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <DollarSign size={15} />
            </div>
          </div>
          <div className="mt-2 space-y-0.5">
            <div className="text-lg sm:text-xl font-extrabold text-slate-900 leading-none">
              {formatPrice(cards.monthSales || 0)}
            </div>
            <div className="text-[10.5px] font-semibold text-blue-600">
              Current 30-day period
            </div>
          </div>
        </div>

        {/* Total Lifetime Revenue */}
        <div className="card p-3.5 bg-white rounded-2xl border-purple-100/80 shadow-xs flex flex-col justify-between hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Total Revenue</span>
            <div className="w-7 h-7 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
              <Sparkles size={15} />
            </div>
          </div>
          <div className="mt-2 space-y-0.5">
            <div className="text-lg sm:text-xl font-extrabold text-slate-900 leading-none">
              {formatPrice(cards.totalSales || 0)}
            </div>
            <div className="text-[10.5px] font-semibold text-purple-600">
              {cards.totalOrders || 0} total orders
            </div>
          </div>
        </div>

        {/* Pending Orders Alert */}
        <Link
          href="/admin/orders?status=PENDING"
          className="card p-3.5 bg-amber-50/40 rounded-2xl border-amber-200/90 shadow-xs flex flex-col justify-between hover:shadow-md transition-all group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-amber-800 uppercase tracking-wider">Pending Orders</span>
            <div className="w-7 h-7 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Clock size={15} />
            </div>
          </div>
          <div className="mt-2 space-y-0.5">
            <div className="text-lg sm:text-xl font-extrabold text-amber-900 leading-none">
              {cards.pendingOrders || 0}
            </div>
            <div className="text-[10.5px] font-bold text-amber-700 flex items-center gap-0.5">
              <span>Needs confirmation</span>
              <ArrowRight size={11} />
            </div>
          </div>
        </Link>

        {/* Delivery Success Rate */}
        <div className="card p-3.5 bg-white rounded-2xl border-cyan-100/80 shadow-xs flex flex-col justify-between hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Delivery Rate</span>
            <div className="w-7 h-7 rounded-lg bg-cyan-50 text-cyan-600 flex items-center justify-center">
              <ShieldCheck size={15} />
            </div>
          </div>
          <div className="mt-2 space-y-0.5">
            <div className="text-lg sm:text-xl font-extrabold text-slate-900 leading-none">
              {cards.deliveryRate || 100}%
            </div>
            <div className="text-[10.5px] font-semibold text-cyan-600">
              {cards.deliveredOrders || 0} delivered orders
            </div>
          </div>
        </div>

        {/* Average Order Value (AOV) */}
        <div className="card p-3.5 bg-white rounded-2xl border-rose-100/80 shadow-xs flex flex-col justify-between hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Avg Order Value</span>
            <div className="w-7 h-7 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
              <BarChart3 size={15} />
            </div>
          </div>
          <div className="mt-2 space-y-0.5">
            <div className="text-lg sm:text-xl font-extrabold text-slate-900 leading-none">
              {formatPrice(cards.aov || 0)}
            </div>
            <div className="text-[10.5px] font-semibold text-slate-400">
              Per customer checkout
            </div>
          </div>
        </div>
      </div>

      {/* 3. Interactive Main Sales Trend Chart & Status Donut */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Sales Trend Chart (8 Cols) */}
        <div className="lg:col-span-8 card p-5 bg-white rounded-3xl border border-slate-100 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-100">
            <div>
              <h3 className="font-extrabold text-base text-slate-900">Revenue & Order Volume Trend</h3>
              <p className="text-xs text-slate-400">Daily sales velocity and customer checkout patterns</p>
            </div>

            {/* Time range switch pills */}
            <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl text-xs font-bold self-start sm:self-auto">
              <button
                type="button"
                onClick={() => setTimeRange('7')}
                className={`py-1 px-3 rounded-lg transition-all cursor-pointer ${
                  timeRange === '7' ? 'bg-white text-emerald-700 shadow-xs' : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                Last 7 Days
              </button>
              <button
                type="button"
                onClick={() => setTimeRange('30')}
                className={`py-1 px-3 rounded-lg transition-all cursor-pointer ${
                  timeRange === '30' ? 'bg-white text-emerald-700 shadow-xs' : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                Last 30 Days
              </button>
            </div>
          </div>

          {/* Area Chart Container */}
          <div className="h-64 sm:h-72 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="salesGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="date" stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis
                  stroke="#94a3b8"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(v) => `৳${v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v}`}
                />
                <Tooltip
                  formatter={(value: any) => [formatPrice(Number(value) || 0), 'Revenue']}
                  labelFormatter={(l) => `Date: ${l}`}
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderRadius: '12px',
                    color: '#fff',
                    border: 'none',
                    fontSize: '12px',
                    boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="#059669"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#salesGrad)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Order Status Breakdown (4 Cols) */}
        <div className="lg:col-span-4 card p-5 bg-white rounded-3xl border border-slate-100 shadow-xs space-y-4 flex flex-col justify-between">
          <div className="pb-2 border-b border-slate-100">
            <h3 className="font-extrabold text-base text-slate-900">Order Status Share</h3>
            <p className="text-xs text-slate-400">Distribution across fulfillment stages</p>
          </div>

          {/* Donut Chart */}
          <div className="h-44 w-full relative flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusDistribution.filter((s: any) => s.count > 0).length > 0 ? statusDistribution.filter((s: any) => s.count > 0) : [{ name: 'No Orders', count: 1, color: '#e2e8f0' }]}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={72}
                  paddingAngle={3}
                  dataKey="count"
                >
                  {statusDistribution.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: any, name: any) => [`${value} Orders`, name]}
                  contentStyle={{ backgroundColor: '#0f172a', borderRadius: '10px', color: '#fff', fontSize: '11px', border: 'none' }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-xl font-extrabold text-slate-900">{cards.totalOrders || 0}</span>
              <span className="text-[9px] font-bold uppercase text-slate-400">Total</span>
            </div>
          </div>

          {/* Status Legend Pills */}
          <div className="grid grid-cols-2 gap-2 text-xs pt-1">
            {statusDistribution.map((st: any) => (
              <div key={st.name} className="flex items-center justify-between p-1.5 rounded-lg bg-slate-50 border border-slate-100">
                <div className="flex items-center gap-1.5 truncate">
                  <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: st.color }} />
                  <span className="text-slate-600 truncate text-[11px]">{st.name}</span>
                </div>
                <strong className="text-slate-900 text-[11px] shrink-0 font-bold">{st.count}</strong>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 4. Secondary Row: Payment Methods + Abandoned Cart Recovery Funnel */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Payment Methods */}
        <div className="card p-5 bg-white rounded-3xl border border-slate-100 shadow-xs space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <h4 className="font-extrabold text-sm text-slate-900 flex items-center gap-1.5">
              <CreditCard size={16} className="text-emerald-600" />
              <span>Payment Methods</span>
            </h4>
            <span className="text-xs text-slate-400 font-semibold">{cards.totalOrders || 0} total</span>
          </div>

          <div className="space-y-2">
            {paymentDistribution.map((pm: any) => {
              const pct = cards.totalOrders > 0 ? Math.round((pm.count / cards.totalOrders) * 100) : 0
              return (
                <div key={pm.name} className="space-y-1 text-xs">
                  <div className="flex justify-between font-bold text-slate-700">
                    <span>{pm.name}</span>
                    <span className="text-slate-900">{pm.count} ({pct}%)</span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full rounded-full transition-all duration-500" style={{ width: `${pct}%`, backgroundColor: pm.color }} />
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Incomplete Cart Recovery Performance */}
        <div className="card p-5 bg-white rounded-3xl border border-slate-100 shadow-xs space-y-3 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h4 className="font-extrabold text-sm text-slate-900 flex items-center gap-1.5">
                <Percent size={16} className="text-amber-600" />
                <span>Cart Recovery Rate</span>
              </h4>
              <Link href="/admin/orders/incomplete" className="text-xs font-bold text-emerald-700 hover:underline">
                View Drafts
              </Link>
            </div>

            <div className="mt-3 space-y-3">
              <div className="flex items-baseline justify-between">
                <span className="text-3xl font-extrabold text-slate-900">{cards.cartRecoveryRate || 0}%</span>
                <span className="badge badge-green font-bold text-xs">{cards.recoveredIncomplete || 0} Recovered</span>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed">
                Total <strong>{cards.incompleteOrders || 0}</strong> abandoned checkout sessions tracked. Automatic lead capture helps recover up to 25% lost sales.
              </p>
            </div>
          </div>

          <Link
            href="/admin/orders/incomplete"
            className="btn btn-outline btn-sm w-full rounded-xl text-xs font-bold flex items-center justify-center gap-1"
          >
            <span>Recover Incomplete Orders</span>
            <ChevronRight size={13} />
          </Link>
        </div>

        {/* Inventory Health & Low Stock Alert */}
        <div className="card p-5 bg-white rounded-3xl border border-slate-100 shadow-xs space-y-3 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h4 className="font-extrabold text-sm text-slate-900 flex items-center gap-1.5">
                <Package size={16} className="text-rose-600" />
                <span>Inventory Health</span>
              </h4>
              <span className="badge badge-gray font-mono text-[11px]">{cards.totalProducts || 0} Published</span>
            </div>

            <div className="mt-3 space-y-2 text-xs">
              <div className="flex justify-between items-center p-2 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-slate-600">Total Active Catalog</span>
                <strong className="text-slate-900 font-bold">{cards.totalProducts || 0} items</strong>
              </div>
              <div className="flex justify-between items-center p-2 rounded-xl bg-amber-50/70 border border-amber-100 text-amber-900">
                <span className="font-semibold">Low Stock Warning (≤ 5 units)</span>
                <strong className="font-extrabold">{cards.lowStockProducts || 0}</strong>
              </div>
              <div className="flex justify-between items-center p-2 rounded-xl bg-rose-50/70 border border-rose-100 text-rose-900">
                <span className="font-semibold">Out of Stock Items</span>
                <strong className="font-extrabold">{cards.outOfStockProducts || 0}</strong>
              </div>
            </div>
          </div>

          <Link
            href="/admin/inventory"
            className="btn btn-primary btn-sm w-full rounded-xl text-xs font-bold flex items-center justify-center gap-1 shadow-xs"
          >
            <span>Manage Inventory & Restock</span>
            <ChevronRight size={13} />
          </Link>
        </div>
      </div>

      {/* 5. Bottom Row: Top Selling Products Leaderboard + Recent Live Orders Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Top Selling Products (5 Cols) */}
        <div className="lg:col-span-5 card p-5 bg-white rounded-3xl border border-slate-100 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <h3 className="font-extrabold text-base text-slate-900 flex items-center gap-2">
              <Flame size={18} className="text-amber-500" />
              <span>Top Selling Products</span>
            </h3>
            <Link href="/admin/products" className="text-xs font-bold text-emerald-700 hover:underline">
              View All
            </Link>
          </div>

          <div className="divide-y divide-slate-100">
            {topProducts.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-400">No sales recorded yet.</div>
            ) : (
              topProducts.map((p: any, idx: number) => (
                <div key={p.id} className="py-3 first:pt-0 last:pb-0 flex items-center gap-3">
                  <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 ${
                    idx === 0 ? 'bg-amber-400 text-slate-950 shadow-xs' : idx === 1 ? 'bg-slate-200 text-slate-800' : 'bg-slate-100 text-slate-600'
                  }`}>
                    {idx + 1}
                  </span>

                  <img
                    src={p.thumbnail || 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=150&q=80'}
                    alt={p.name}
                    className="w-10 h-10 rounded-xl object-cover border border-slate-100 shrink-0"
                  />

                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-xs text-slate-800 line-clamp-1">{p.name}</div>
                    <div className="text-[11px] text-slate-400 flex items-center gap-2">
                      <span>{p.category?.name || 'Organic'}</span>
                      <span>•</span>
                      <span className="font-bold text-emerald-700">{formatPrice(p.salePrice || p.regularPrice)}</span>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <div className="font-extrabold text-xs text-slate-900">{p.soldCount || 0} sold</div>
                    <div className="text-[10px] text-slate-400">{p.stock} in stock</div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent Live Orders Feed (7 Cols) */}
        <div className="lg:col-span-7 card p-5 bg-white rounded-3xl border border-slate-100 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <div>
              <h3 className="font-extrabold text-base text-slate-900">Recent Customer Orders</h3>
              <p className="text-xs text-slate-400">Latest incoming purchases awaiting dispatch</p>
            </div>
            <Link href="/admin/orders" className="btn btn-outline btn-sm rounded-xl text-xs font-bold flex items-center gap-1">
              <span>All Orders</span>
              <ChevronRight size={13} />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 font-bold uppercase text-[10px]">
                  <th className="pb-2">Order #</th>
                  <th className="pb-2">Customer</th>
                  <th className="pb-2">Amount</th>
                  <th className="pb-2">Payment</th>
                  <th className="pb-2">Status</th>
                  <th className="pb-2 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recentOrders.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-xs text-slate-400">No orders placed yet.</td>
                  </tr>
                ) : (
                  recentOrders.slice(0, 7).map((ord: any) => {
                    const statusConfig = STATUS_BADGE[ord.status] || { bg: 'bg-slate-100 text-slate-700', label: ord.status }
                    return (
                      <tr key={ord.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3 font-mono font-bold text-slate-900">
                          <Link href={`/admin/orders?search=${ord.orderNumber}`} className="hover:text-emerald-600 hover:underline">
                            {ord.orderNumber}
                          </Link>
                        </td>
                        <td className="py-3">
                          <div className="font-bold text-slate-800 line-clamp-1">{ord.shippingName}</div>
                          <div className="text-[10px] text-slate-400 font-mono">{ord.shippingPhone}</div>
                        </td>
                        <td className="py-3 font-extrabold text-slate-900">
                          {formatPrice(ord.total)}
                        </td>
                        <td className="py-3">
                          <span className="badge badge-gray text-[10px] font-mono font-semibold">
                            {ord.paymentMethod}
                          </span>
                        </td>
                        <td className="py-3">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${statusConfig.bg}`}>
                            {statusConfig.label}
                          </span>
                        </td>
                        <td className="py-3 text-right">
                          <Link
                            href={`/admin/orders?search=${ord.orderNumber}`}
                            className="btn btn-ghost btn-sm p-1.5 text-slate-500 hover:text-emerald-700"
                            title="View Order Details"
                          >
                            <Eye size={15} />
                          </Link>
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
