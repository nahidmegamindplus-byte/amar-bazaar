'use client'
import { useState, useEffect } from 'react'
import { Zap, Plus, Clock } from 'lucide-react'
import { formatDate } from '@/lib/utils'

export default function AdminFlashSalePage() {
  const [sales, setSales] = useState<any[]>([
    {
      id: '1',
      name: 'Weekend Mega Organic Flash Sale 🔥',
      startTime: new Date(),
      endTime: new Date(Date.now() + 3 * 86400000),
      isActive: true,
      itemsCount: 8,
    }
  ])

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">Flash Sale Events</h1>
          <p className="text-xs text-slate-500 mt-1">Configure limited-time flash discount events and synchronized timers</p>
        </div>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>Event Name</th>
                <th>Start Date</th>
                <th>End Date</th>
                <th>Discount Items</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {sales.map((s) => (
                <tr key={s.id}>
                  <td className="font-bold text-slate-800 text-sm flex items-center gap-2">
                    <Zap size={15} className="text-amber-500" />
                    <span>{s.name}</span>
                  </td>
                  <td className="text-xs text-slate-500">{formatDate(s.startTime)}</td>
                  <td className="text-xs text-slate-500">{formatDate(s.endTime)}</td>
                  <td className="font-bold text-emerald-700 text-xs">{s.itemsCount} products</td>
                  <td><span className="badge badge-green font-bold text-xs">Live Active</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
