'use client'
import { useState, useEffect } from 'react'
import { Gift, Plus } from 'lucide-react'

export default function AdminCombosPage() {
  const [combos, setCombos] = useState<any[]>([
    { id: '1', title: 'Sundarban Raw Honey + Pure Ghee Pack', price: 1650, discount: 200, status: 'ACTIVE' },
    { id: '2', title: 'Cold-Pressed Mustard Oil (2L) + Kalojira Oil Bundle', price: 920, discount: 100, status: 'ACTIVE' },
  ])

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900">Combo Deals & Bundles</h1>
        <p className="text-xs text-slate-500 mt-1">Create product bundle packages with combined special pricing</p>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>Combo Package</th>
                <th>Bundle Price</th>
                <th>Savings</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {combos.map((c) => (
                <tr key={c.id}>
                  <td className="font-bold text-slate-800 text-sm flex items-center gap-2">
                    <Gift size={15} className="text-emerald-600" />
                    <span>{c.title}</span>
                  </td>
                  <td className="font-bold text-emerald-700">৳{c.price}</td>
                  <td className="text-xs font-semibold text-rose-600">Save ৳{c.discount}</td>
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
