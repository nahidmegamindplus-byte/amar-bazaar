'use client'
import { useState, useEffect } from 'react'
import { Archive, Plus, AlertTriangle, RefreshCw } from 'lucide-react'
import { getStockStatus, formatPrice } from '@/lib/utils'
import toast from 'react-hot-toast'

export default function AdminInventoryPage() {
  const [products, setProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const fetchStock = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/products?limit=50')
      const data = await res.json()
      if (data.success) setProducts(data.data)
    } catch {
      toast.error('Failed to load inventory')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchStock()
  }, [])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">Inventory & Stock Tracking</h1>
          <p className="text-xs text-slate-500 mt-1">Real-time product stock levels and low inventory alerts</p>
        </div>
        <button onClick={fetchStock} className="btn btn-outline btn-sm flex items-center gap-1.5">
          <RefreshCw size={14} />
          <span>Refresh Stock</span>
        </button>
      </div>

      <div className="card overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-400">Loading inventory...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>SKU</th>
                  <th>Unit</th>
                  <th>Stock Available</th>
                  <th>Sold Units</th>
                  <th>Stock Status</th>
                </tr>
              </thead>
              <tbody>
                {products.map((p) => {
                  const status = getStockStatus(p.stock, p.lowStockThreshold)
                  return (
                    <tr key={p.id}>
                      <td className="font-bold text-slate-800 text-sm">{p.name}</td>
                      <td className="text-xs text-slate-500 font-mono">{p.sku || '—'}</td>
                      <td className="text-xs text-slate-600">{p.unit || 'pcs'}</td>
                      <td className="font-bold text-slate-900 text-sm">{p.stock} units</td>
                      <td className="text-xs font-semibold text-emerald-700">{p.soldCount || 0} sold</td>
                      <td>
                        {status === 'IN_STOCK' && <span className="badge badge-green">In Stock</span>}
                        {status === 'LOW_STOCK' && <span className="badge badge-yellow">Low Stock</span>}
                        {status === 'OUT_OF_STOCK' && <span className="badge badge-red">Out of Stock</span>}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
