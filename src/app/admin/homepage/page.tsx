'use client'
import { useState, useEffect } from 'react'
import { Home, Save, CheckCircle2, ArrowUp, ArrowDown } from 'lucide-react'
import toast from 'react-hot-toast'

export default function AdminHomepageSectionsPage() {
  const [sections, setSections] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/admin/homepage')
      .then(r => r.json())
      .then(d => { if (d.success) setSections(d.data) })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const handleToggle = (id: string, current: boolean) => {
    setSections(prev => prev.map(s => s.id === id ? { ...s, isActive: !current } : s))
  }

  const handleSave = async () => {
    try {
      const res = await fetch('/api/admin/homepage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sections }),
      })
      if (res.ok) toast.success('Homepage layout saved!')
      else toast.error('Failed to save layout')
    } catch {
      toast.error('Error saving layout')
    }
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">Homepage Layout Manager</h1>
          <p className="text-xs text-slate-500 mt-1">Control and toggle storefront homepage sections without touching code</p>
        </div>
        <button onClick={handleSave} className="btn btn-primary btn-sm rounded-xl flex items-center gap-1.5 shadow-md">
          <Save size={15} />
          <span>Save Order</span>
        </button>
      </div>

      <div className="card divide-y divide-slate-100 overflow-hidden">
        {sections.map((sec, i) => (
          <div key={sec.id} className="p-4 flex items-center justify-between bg-white hover:bg-slate-50 transition-colors">
            <div className="flex items-center gap-3">
              <span className="w-6 h-6 rounded-full bg-slate-100 text-slate-600 text-xs font-bold flex items-center justify-center">
                {i + 1}
              </span>
              <div>
                <h4 className="font-bold text-sm text-slate-800">{sec.heading || sec.type}</h4>
                <span className="text-[11px] text-slate-400 font-mono">{sec.type}</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold">
                <input
                  type="checkbox"
                  checked={sec.isActive}
                  onChange={() => handleToggle(sec.id, sec.isActive)}
                  className="rounded text-emerald-600"
                />
                <span>{sec.isActive ? 'Active' : 'Hidden'}</span>
              </label>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
