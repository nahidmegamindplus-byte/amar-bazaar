'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  ShoppingBag, TrendingUp, Users, Package, AlertTriangle,
  ArrowUpRight, ArrowDownRight, Clock, CheckCircle, XCircle,
  Truck, BarChart2, RefreshCw, Eye
} from 'lucide-react'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { formatPrice, formatDateTime, formatDate } from '@/lib/utils'

const ORDER_STATUS_COLORS: Record<string, string> = {
  PENDING: '#f97316',
  CONFIRMED: '#3b82f6',
  PROCESSING: '#8b5cf6',
  PACKED: '#06b6d4',
  SHIPPED: '#6366f1',
  OUT_FOR_DELIVERY: '#f59e0b',
  DELIVERED: '#16a34a',
  CANCELLED: '#ef4444',
  RETURNED: '#64748b',
  REFUNDED: '#94a3b8',
}

const STATUS_LABEL: Record<string, string> = {
  PENDING: 'Pending',
  CONFIRMED: 'Confirmed',
  PROCESSING: 'Processing',
  PACKED: 'Packed',
  SHIPPED: 'Shipped',
  OUT_FOR_DELIVERY: 'Out for Delivery',
  DELIVERED: 'Delivered',
  CANCELLED: 'Cancelled',
}

const PIE_COLORS = ['#f97316', '#3b82f6', '#16a34a', '#ef4444']

export default function AdminDashboard() {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const fetchData = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/analytics')
      const json = await res.json()
      if (json.success) setData(json.data)
      else setError('Failed to load analytics')
    } catch {
      setError('Network error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchData() }, [])

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '400px', flexDirection: 'column', gap: '1rem' }}>
      <RefreshCw size={32} style={{ animation: 'spin 1s linear infinite', color: '#16a34a' }} />
      <p style={{ color: '#64748b', margin: 0 }}>Loading dashboard...</p>
    </div>
  )

  if (error) return (
    <div style={{ padding: '2rem', textAlign: 'center' }}>
      <p style={{ color: '#ef4444' }}>{error}</p>
      <button className="btn btn-primary" onClick={fetchData}>Retry</button>
    </div>
  )

  const cards = data?.cards || {}

  const statCards = [
    { label: "Today's Sales", value: formatPrice(cards.todaySales || 0), icon: TrendingUp, color: '#16a34a', bg: '#f0fdf4', change: cards.todayOrders > 0 ? '+' + cards.todayOrders + ' orders' : 'No orders yet' },
    { label: "Today's Orders", value: cards.todayOrders || 0, icon: ShoppingBag, color: '#3b82f6', bg: '#eff6ff', change: 'New orders today' },
    { label: 'Total Revenue', value: formatPrice(cards.totalSales || 0), icon: TrendingUp, color: '#8b5cf6', bg: '#f5f3ff', change: cards.totalOrders + ' total orders' },
    { label: 'Total Orders', value: cards.totalOrders || 0, icon: ShoppingBag, color: '#f97316', bg: '#fff7ed', change: cards.pendingOrders + ' pending' },
    { label: 'Pending Orders', value: cards.pendingOrders || 0, icon: Clock, color: '#f97316', bg: '#fff7ed', change: 'Needs attention' },
    { label: 'Active Orders', value: cards.processingOrders || 0, icon: Truck, color: '#06b6d4', bg: '#ecfeff', change: 'In fulfillment' },
    { label: 'Delivered', value: cards.deliveredOrders || 0, icon: CheckCircle, color: '#16a34a', bg: '#f0fdf4', change: 'Completed orders' },
    { label: 'Cancelled', value: cards.cancelledOrders || 0, icon: XCircle, color: '#ef4444', bg: '#fef2f2', change: 'Cancelled orders' },
    { label: 'Total Customers', value: cards.totalCustomers || 0, icon: Users, color: '#8b5cf6', bg: '#f5f3ff', change: '+' + (cards.newCustomersToday || 0) + ' today' },
    { label: 'Total Products', value: cards.totalProducts || 0, icon: Package, color: '#0ea5e9', bg: '#f0f9ff', change: cards.lowStockProducts + ' low stock' },
    { label: 'Low Stock', value: cards.lowStockProducts || 0, icon: AlertTriangle, color: '#f59e0b', bg: '#fffbeb', change: 'Needs restock' },
    { label: 'Out of Stock', value: cards.outOfStockProducts || 0, icon: AlertTriangle, color: '#ef4444', bg: '#fef2f2', change: 'Unavailable' },
  ]

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.75rem' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 700, color: '#0f172a' }}>Dashboard</h1>
          <p style={{ margin: '0.25rem 0 0', color: '#64748b', fontSize: '0.875rem' }}>
            Welcome back! Here's your store overview.
          </p>
        </div>
        <button className="btn btn-outline" onClick={fetchData} style={{ gap: '0.4rem' }}>
          <RefreshCw size={14} /> Refresh
        </button>
      </div>

      {/* Stats Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
        {statCards.map((card) => (
          <div key={card.label} className="stat-card" style={{ border: '1px solid #f1f5f9' }}>
            <div className="stat-icon" style={{ background: card.bg }}>
              <card.icon size={20} color={card.color} />
            </div>
            <div>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a', lineHeight: 1.2 }}>
                {typeof card.value === 'number' ? card.value.toLocaleString() : card.value}
              </div>
              <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '0.15rem' }}>{card.label}</div>
              <div style={{ fontSize: '0.72rem', color: card.color, marginTop: '0.25rem', fontWeight: 500 }}>{card.change}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '1.25rem', marginBottom: '2rem' }}>
        {/* Revenue Chart */}
        <div className="card" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <div>
              <h2 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: '#0f172a' }}>Revenue Trend</h2>
              <p style={{ margin: '0.2rem 0 0', fontSize: '0.8rem', color: '#64748b' }}>Last 30 days</p>
            </div>
            <BarChart2 size={18} color="#94a3b8" />
          </div>
          {data?.chartData && data.chartData.some((d: any) => d.revenue > 0) ? (
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={data.chartData}>
                <defs>
                  <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#16a34a" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#16a34a" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#94a3b8' }} tickFormatter={(v) => v.slice(5)} />
                <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} tickFormatter={(v) => `৳${(v / 1000).toFixed(0)}k`} />
                <Tooltip
                  formatter={(value: any) => [`৳${Number(value || 0).toLocaleString()}`, 'Revenue']}
                  labelFormatter={(label: any) => label ? formatDate(String(label)) : ''}
                  contentStyle={{ borderRadius: '0.5rem', border: '1px solid #e2e8f0', fontSize: '0.8rem' }}
                />
                <Area type="monotone" dataKey="revenue" stroke="#16a34a" strokeWidth={2} fill="url(#revenueGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="empty-state" style={{ padding: '2rem' }}>
              <BarChart2 size={40} color="#cbd5e1" />
              <p style={{ color: '#94a3b8', marginTop: '0.75rem', fontSize: '0.875rem' }}>No sales data available yet.</p>
            </div>
          )}
        </div>

        {/* Order Status Pie */}
        <div className="card" style={{ padding: '1.5rem' }}>
          <h2 style={{ margin: '0 0 1.25rem', fontSize: '1rem', fontWeight: 700, color: '#0f172a' }}>Orders by Status</h2>
          {data?.statusCounts && data.statusCounts.some((s: any) => s.count > 0) ? (
            <>
              <ResponsiveContainer width="100%" height={160}>
                <PieChart>
                  <Pie data={data.statusCounts} cx="50%" cy="50%" innerRadius={45} outerRadius={75} dataKey="count" paddingAngle={3}>
                    {data.statusCounts.map((_: any, index: number) => (
                      <Cell key={index} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: any, name: any) => [value, name]} contentStyle={{ borderRadius: '0.5rem', fontSize: '0.8rem' }} />
                </PieChart>
              </ResponsiveContainer>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '0.75rem' }}>
                {data.statusCounts.map((s: any, i: number) => (
                  <div key={s.status} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', color: '#475569' }}>
                      <div style={{ width: '10px', height: '10px', borderRadius: '2px', background: PIE_COLORS[i % PIE_COLORS.length] }} />
                      {s.status}
                    </div>
                    <span style={{ fontWeight: 700, fontSize: '0.875rem', color: '#0f172a' }}>{s.count}</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="empty-state" style={{ padding: '2rem' }}>
              <p style={{ color: '#94a3b8', fontSize: '0.875rem' }}>No orders yet.</p>
            </div>
          )}
        </div>
      </div>

      {/* Bottom Row: Recent Orders + Top Products */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: '1.25rem' }}>
        {/* Recent Orders */}
        <div className="card" style={{ padding: '1.5rem', overflow: 'hidden' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h2 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: '#0f172a' }}>Recent Orders</h2>
            <Link href="/admin/orders" className="btn btn-ghost btn-sm" style={{ color: '#16a34a', textDecoration: 'none' }}>
              View All <ArrowUpRight size={14} />
            </Link>
          </div>
          {data?.recentOrders?.length > 0 ? (
            <div style={{ overflowX: 'auto' }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Order #</th>
                    <th>Customer</th>
                    <th>Total</th>
                    <th>Status</th>
                    <th>Date</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {data.recentOrders.map((order: any) => (
                    <tr key={order.id}>
                      <td style={{ fontWeight: 600, color: '#0f172a' }}>{order.orderNumber}</td>
                      <td>
                        <div style={{ fontWeight: 500 }}>{order.shippingName}</div>
                        <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{order.shippingPhone}</div>
                      </td>
                      <td style={{ fontWeight: 700, color: '#16a34a' }}>{formatPrice(order.total)}</td>
                      <td>
                        <span className="badge" style={{ background: ORDER_STATUS_COLORS[order.status] + '20', color: ORDER_STATUS_COLORS[order.status] }}>
                          {STATUS_LABEL[order.status] || order.status}
                        </span>
                      </td>
                      <td style={{ color: '#64748b', fontSize: '0.8rem' }}>{formatDate(order.createdAt)}</td>
                      <td>
                        <Link href={`/admin/orders?id=${order.id}`} className="btn btn-ghost btn-sm">
                          <Eye size={14} />
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="empty-state">
              <ShoppingBag size={40} color="#cbd5e1" />
              <p style={{ color: '#94a3b8', margin: '0.75rem 0 0', fontSize: '0.875rem' }}>No orders yet.</p>
              <p style={{ color: '#cbd5e1', margin: '0.25rem 0 0', fontSize: '0.8rem' }}>Orders will appear here once customers start placing them.</p>
            </div>
          )}
        </div>

        {/* Top Products */}
        <div className="card" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h2 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: '#0f172a' }}>Top Selling</h2>
            <Link href="/admin/products" className="btn btn-ghost btn-sm" style={{ color: '#16a34a', textDecoration: 'none', fontSize: '0.8rem' }}>
              All Products
            </Link>
          </div>
          {data?.topProducts?.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {data.topProducts.map((p: any, i: number) => (
                <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div style={{ width: '1.5rem', height: '1.5rem', background: i < 3 ? '#fef9c3' : '#f1f5f9', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', fontWeight: 700, color: i < 3 ? '#ca8a04' : '#64748b', flexShrink: 0 }}>
                    {i + 1}
                  </div>
                  <div style={{ width: '2.5rem', height: '2.5rem', background: '#f8fafc', borderRadius: '0.5rem', overflow: 'hidden', flexShrink: 0 }}>
                    {p.thumbnail ? (
                      <img src={p.thumbnail} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Package size={16} color="#cbd5e1" />
                      </div>
                    )}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '0.825rem', fontWeight: 500, color: '#0f172a', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.name}</div>
                    <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>{p.soldCount} sold · {formatPrice(p.salePrice || p.regularPrice)}</div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state" style={{ padding: '2rem' }}>
              <Package size={32} color="#cbd5e1" />
              <p style={{ color: '#94a3b8', margin: '0.75rem 0 0', fontSize: '0.825rem' }}>No products yet. Add your first product.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
