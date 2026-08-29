'use client'
import { useState, useEffect } from 'react'
import { BarChart2, TrendingUp, ShoppingBag, Users, RefreshCw } from 'lucide-react'
import { formatPrice } from '@/lib/utils'

export default function AdminAnalyticsPage() {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/analytics')
      .then(r => r.json())
      .then(d => { if (d.success) setData(d.data) })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="p-12 text-center text-slate-400">Loading analytics...</div>

  const cards = data?.cards || {}

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900">Analytics & Sales Reports</h1>
        <p className="text-xs text-slate-500 mt-1">Live database performance metrics and revenue breakdown</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card p-5 bg-white space-y-2 border border-slate-100">
          <div className="text-xs text-slate-500 font-bold uppercase tracking-wider">Total Lifetime Sales</div>
          <div className="text-2xl font-extrabold text-emerald-700">{formatPrice(cards.totalSales || 0)}</div>
          <div className="text-[11px] text-slate-400">From {cards.totalOrders || 0} completed orders</div>
        </div>

        <div className="card p-5 bg-white space-y-2 border border-slate-100">
          <div className="text-xs text-slate-500 font-bold uppercase tracking-wider">Today's Revenue</div>
          <div className="text-2xl font-extrabold text-slate-900">{formatPrice(cards.todaySales || 0)}</div>
          <div className="text-[11px] text-emerald-600 font-semibold">{cards.todayOrders || 0} orders today</div>
        </div>

        <div className="card p-5 bg-white space-y-2 border border-slate-100">
          <div className="text-xs text-slate-500 font-bold uppercase tracking-wider">Pending Orders</div>
          <div className="text-2xl font-extrabold text-amber-600">{cards.pendingOrders || 0}</div>
          <div className="text-[11px] text-slate-400">Needs fulfillment</div>
        </div>

        <div className="card p-5 bg-white space-y-2 border border-slate-100">
          <div className="text-xs text-slate-500 font-bold uppercase tracking-wider">Total Customers</div>
          <div className="text-2xl font-extrabold text-slate-900">{cards.totalCustomers || 0}</div>
          <div className="text-[11px] text-slate-400">Registered accounts</div>
        </div>
      </div>
    </div>
  )
}
