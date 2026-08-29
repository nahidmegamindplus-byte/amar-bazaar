'use client'
import { useState, useEffect } from 'react'
import { Truck, Plus, Save } from 'lucide-react'
import { formatPrice } from '@/lib/utils'
import toast from 'react-hot-toast'

export default function AdminDeliveryPage() {
  const [zones, setZones] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // load mock delivery zones or fetch
    setZones([
      { id: '1', name: 'Inside Dhaka City', charge: 60, freeThreshold: 999, estimatedDays: '1-2 days' },
      { id: '2', name: 'Dhaka Suburbs (Savar, Gazipur, Narayanganj)', charge: 100, freeThreshold: 1499, estimatedDays: '2-3 days' },
      { id: '3', name: 'Outside Dhaka (All other 63 Districts)', charge: 130, freeThreshold: 1999, estimatedDays: '3-5 days' },
    ])
    setLoading(false)
  }, [])

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900">Delivery & Shipping Rates</h1>
        <p className="text-xs text-slate-500 mt-1">Configure shipping rates for Inside Dhaka, Suburbs, and across Bangladesh</p>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>Delivery Zone</th>
                <th>Standard Charge</th>
                <th>Free Delivery On</th>
                <th>Estimated Time</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {zones.map((z) => (
                <tr key={z.id}>
                  <td className="font-bold text-slate-800 text-sm">{z.name}</td>
                  <td className="font-bold text-emerald-700">{formatPrice(z.charge)}</td>
                  <td className="text-xs font-semibold text-slate-600">Orders above {formatPrice(z.freeThreshold)}</td>
                  <td className="text-xs text-slate-500">{z.estimatedDays}</td>
                  <td><span className="badge badge-green">Active</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
