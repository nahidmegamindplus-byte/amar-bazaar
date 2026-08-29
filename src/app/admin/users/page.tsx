'use client'
import { useState, useEffect } from 'react'
import { ShieldCheck, Plus, UserCheck } from 'lucide-react'
import { formatDate } from '@/lib/utils'

export default function AdminUsersPage() {
  const [users, setUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setUsers([
      { id: '1', name: 'Super Admin', email: 'admin@shuddho.com', role: 'SUPER_ADMIN', status: 'ACTIVE', createdAt: new Date() },
      { id: '2', name: 'Order Manager', email: 'orders@shuddho.com', role: 'ORDER_MANAGER', status: 'ACTIVE', createdAt: new Date() },
    ])
    setLoading(false)
  }, [])

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900">Admin Staff & Roles</h1>
        <p className="text-xs text-slate-500 mt-1">Manage admin team members, role assignments and access permissions</p>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>Admin Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Status</th>
                <th>Joined</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id}>
                  <td className="font-bold text-slate-800 text-sm">{u.name}</td>
                  <td className="text-xs text-slate-600">{u.email}</td>
                  <td><span className="badge badge-purple">{u.role}</span></td>
                  <td><span className="badge badge-green">{u.status}</span></td>
                  <td className="text-xs text-slate-400">{formatDate(u.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
