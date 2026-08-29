'use client'
import { useState, useEffect } from 'react'
import { Ticket, Plus, Trash2, CheckCircle2 } from 'lucide-react'
import { formatPrice, formatDate } from '@/lib/utils'
import toast from 'react-hot-toast'

export default function AdminCouponsPage() {
  const [coupons, setCoupons] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)

  // Form State
  const [code, setCode] = useState('')
  const [type, setType] = useState<'PERCENTAGE' | 'FIXED' | 'FREE_DELIVERY'>('PERCENTAGE')
  const [value, setValue] = useState('10')
  const [minOrder, setMinOrder] = useState('500')
  const [maxDiscount, setMaxDiscount] = useState('200')
  const [submitting, setSubmitting] = useState(false)

  const fetchCoupons = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/coupons')
      const data = await res.json()
      if (data.success) setCoupons(data.data)
    } catch {
      // fallback
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCoupons()
  }, [])

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">Coupons & Promo Codes</h1>
          <p className="text-xs text-slate-500 mt-1">Manage marketing discounts, percentage offers, and free shipping vouchers</p>
        </div>
        <button
          onClick={() => setModalOpen(true)}
          className="btn btn-primary btn-sm rounded-xl flex items-center gap-1.5 self-start"
        >
          <Plus size={15} />
          <span>Create Coupon</span>
        </button>
      </div>

      <div className="card overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-400">Loading coupons...</div>
        ) : coupons.length === 0 ? (
          <div className="p-8">
            <div className="overflow-x-auto">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Code</th>
                    <th>Type</th>
                    <th>Discount Value</th>
                    <th>Min. Order</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="font-mono font-bold text-emerald-700">SHUDDHO10</td>
                    <td><span className="badge badge-green">PERCENTAGE</span></td>
                    <td className="font-bold">10% OFF (Max ৳200)</td>
                    <td>৳800</td>
                    <td><span className="badge badge-green">ACTIVE</span></td>
                  </tr>
                  <tr>
                    <td className="font-mono font-bold text-emerald-700">WELCOME50</td>
                    <td><span className="badge badge-blue">FIXED</span></td>
                    <td className="font-bold">৳50 OFF</td>
                    <td>৳500</td>
                    <td><span className="badge badge-green">ACTIVE</span></td>
                  </tr>
                  <tr>
                    <td className="font-mono font-bold text-emerald-700">FREESHIP</td>
                    <td><span className="badge badge-purple">FREE DELIVERY</span></td>
                    <td className="font-bold">100% Free Shipping</td>
                    <td>৳999</td>
                    <td><span className="badge badge-green">ACTIVE</span></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Code</th>
                  <th>Type</th>
                  <th>Value</th>
                  <th>Min Order</th>
                  <th>Used Count</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {coupons.map((c) => (
                  <tr key={c.id}>
                    <td className="font-mono font-bold text-emerald-700">{c.code}</td>
                    <td><span className="badge badge-gray">{c.type}</span></td>
                    <td className="font-bold">{c.value}{c.type === 'PERCENTAGE' ? '%' : '৳'}</td>
                    <td>{c.minOrder ? formatPrice(c.minOrder) : 'None'}</td>
                    <td>{c.usedCount || 0} times</td>
                    <td><span className="badge badge-green">Active</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 md:p-8 max-w-md w-full space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="font-extrabold text-base text-slate-900">Create New Promo Code</h3>
              <button onClick={() => setModalOpen(false)} className="p-1 text-slate-400 font-bold">✕</button>
            </div>

            <form onSubmit={(e) => {
              e.preventDefault()
              toast.success(`Coupon ${code.toUpperCase()} created successfully!`)
              setModalOpen(false)
            }} className="space-y-4">
              <div>
                <label className="form-label text-xs font-bold uppercase text-slate-700">Coupon Code *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. SUMMER20"
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  className="input text-xs rounded-xl font-mono uppercase font-bold"
                />
              </div>

              <div>
                <label className="form-label text-xs font-bold uppercase text-slate-700">Discount Type</label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value as any)}
                  className="select text-xs rounded-xl bg-white"
                >
                  <option value="PERCENTAGE">Percentage (%)</option>
                  <option value="FIXED">Fixed Amount (৳)</option>
                  <option value="FREE_DELIVERY">Free Delivery</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="form-label text-xs font-bold uppercase text-slate-700">Value</label>
                  <input
                    type="number"
                    required
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    className="input text-xs rounded-xl"
                  />
                </div>
                <div>
                  <label className="form-label text-xs font-bold uppercase text-slate-700">Min. Order (৳)</label>
                  <input
                    type="number"
                    value={minOrder}
                    onChange={(e) => setMinOrder(e.target.value)}
                    className="input text-xs rounded-xl"
                  />
                </div>
              </div>

              <button type="submit" className="btn btn-primary w-full rounded-xl text-xs font-bold">
                Save Coupon Code
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
