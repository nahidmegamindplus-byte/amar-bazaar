'use client'
import { useState, useEffect } from 'react'
import { Users, Search, Mail, Phone, Calendar, ShoppingBag } from 'lucide-react'
import { formatDate } from '@/lib/utils'

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/admin/customers')
      .then(r => r.json())
      .then(data => {
        if (data.success) setCustomers(data.data)
        else setCustomers([])
      })
      .catch(() => setCustomers([]))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900">Customers Management</h1>
        <p className="text-xs text-slate-500 mt-1">View registered customers and their order activities</p>
      </div>

      <div className="card overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-400">Loading customers...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Customer Name</th>
                  <th>Contact Info</th>
                  <th>Total Orders</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Joined Date</th>
                </tr>
              </thead>
              <tbody>
                {customers.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-8 text-slate-400 text-xs">
                      No customer accounts registered yet.
                    </td>
                  </tr>
                ) : (
                  customers.map((c) => (
                    <tr key={c.id}>
                      <td className="font-bold text-slate-800">{c.name || 'Anonymous'}</td>
                      <td className="text-xs text-slate-500">
                        <div>{c.email || '—'}</div>
                        <div>{c.phone || '—'}</div>
                      </td>
                      <td className="font-bold text-emerald-700 text-xs">{c._count?.orders || 0} orders</td>
                      <td><span className="badge badge-gray">{c.role}</span></td>
                      <td><span className="badge badge-green">{c.status}</span></td>
                      <td className="text-xs text-slate-400">{formatDate(c.createdAt)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
