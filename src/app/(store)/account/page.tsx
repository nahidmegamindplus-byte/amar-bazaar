'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { User, Package, Heart, LogOut, MapPin, Phone, Mail, Clock, ShoppingBag } from 'lucide-react'
import { formatPrice, formatDate } from '@/lib/utils'
import toast from 'react-hot-toast'

export default function CustomerAccountPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [orders, setOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchProfileAndOrders()
  }, [])

  const fetchProfileAndOrders = async () => {
    setLoading(true)
    try {
      const [userRes, ordersRes] = await Promise.all([
        fetch('/api/auth/me'),
        fetch('/api/orders'),
      ])

      if (userRes.ok) {
        const u = await userRes.json()
        setUser(u.user)
      } else {
        router.push('/login')
        return
      }

      if (ordersRes.ok) {
        const o = await ordersRes.json()
        if (o.success) setOrders(o.data)
      }
    } catch {
      toast.error('Failed to load user profile')
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    toast.success('Logged out successfully')
    router.push('/')
    router.refresh()
  }

  if (loading) {
    return (
      <div className="container py-16 text-center text-slate-400">
        <div className="animate-spin text-3xl mb-3">⏳</div>
        <p className="text-sm">Loading your account...</p>
      </div>
    )
  }

  return (
    <div className="container py-8 space-y-8 max-w-5xl mx-auto">
      {/* Profile Header */}
      <div className="bg-gradient-to-r from-emerald-800 to-slate-900 text-white rounded-3xl p-6 md:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-md">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-emerald-500 text-white flex items-center justify-center font-extrabold text-2xl shadow-inner">
            {user?.name?.charAt(0).toUpperCase() || 'U'}
          </div>
          <div>
            <h1 className="text-xl md:text-2xl font-extrabold">{user?.name}</h1>
            <p className="text-emerald-200 text-xs mt-0.5">{user?.email || user?.phone || 'Customer'}</p>
            <span className="badge badge-green font-bold text-[10px] mt-2 inline-block">Active Member</span>
          </div>
        </div>

        <div className="flex gap-3">
          <Link href="/wishlist" className="btn bg-white/10 hover:bg-white/20 text-white border border-white/20 btn-sm rounded-xl text-xs flex items-center gap-1.5">
            <Heart size={14} />
            <span>Wishlist</span>
          </Link>
          <button onClick={handleLogout} className="btn bg-rose-500/20 hover:bg-rose-500/30 text-rose-200 border border-rose-400/30 btn-sm rounded-xl text-xs flex items-center gap-1.5">
            <LogOut size={14} />
            <span>Logout</span>
          </button>
        </div>
      </div>

      {/* Orders List Section */}
      <div className="bg-white rounded-3xl border border-slate-100 p-6 md:p-8 shadow-xs space-y-6">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div>
            <h2 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
              <Package size={20} className="text-emerald-600" />
              <span>My Orders (আমার অর্ডারসমূহ)</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">{orders.length} total orders placed</p>
          </div>
        </div>

        {orders.length === 0 ? (
          <div className="p-8 text-center space-y-3">
            <ShoppingBag size={36} className="mx-auto text-slate-300" />
            <h3 className="font-bold text-sm text-slate-800">No Orders Yet</h3>
            <p className="text-xs text-slate-500">You haven't placed any organic grocery orders yet.</p>
            <Link href="/shop" className="btn btn-primary btn-sm rounded-xl font-bold">
              Shop Now
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((ord: any) => (
              <div key={ord.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-sm text-slate-900">{ord.orderNumber}</span>
                    <span className="badge badge-green text-[10px] font-bold">{ord.status}</span>
                  </div>
                  <div className="text-xs text-slate-500">
                    Placed on {formatDate(ord.createdAt)} · Payment: {ord.paymentMethod}
                  </div>
                </div>

                <div className="flex items-center justify-between md:justify-end gap-4">
                  <div className="text-right">
                    <div className="text-xs text-slate-400">Total</div>
                    <div className="font-extrabold text-sm text-emerald-700">{formatPrice(ord.total)}</div>
                  </div>

                  <Link
                    href={`/track-order?order=${ord.orderNumber}&phone=${ord.shippingPhone}`}
                    className="btn btn-outline btn-sm rounded-xl text-xs font-bold"
                  >
                    Track Status
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
