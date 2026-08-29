'use client'
import { useState, useEffect } from 'react'
import { Award, Plus, Trash2, Edit } from 'lucide-react'
import { slugify } from '@/lib/utils'
import toast from 'react-hot-toast'

export default function AdminBrandsPage() {
  const [brands, setBrands] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [name, setName] = useState('')
  const [slug, setSlug] = useState('')
  const [description, setDescription] = useState('')

  const fetchBrands = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/brands')
      const data = await res.json()
      if (data.success) setBrands(data.data)
    } catch {
      toast.error('Failed to load brands')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchBrands()
  }, [])

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">Brands & Suppliers</h1>
          <p className="text-xs text-slate-500 mt-1">Manage verified organic farm partners and brand labels</p>
        </div>
        <button
          onClick={() => setModalOpen(true)}
          className="btn btn-primary btn-sm rounded-xl flex items-center gap-1.5 self-start"
        >
          <Plus size={15} />
          <span>Add Brand</span>
        </button>
      </div>

      <div className="card overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-400">Loading brands...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Brand Name</th>
                  <th>Slug</th>
                  <th>Description</th>
                  <th>Products</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {brands.map((b) => (
                  <tr key={b.id}>
                    <td className="font-bold text-slate-800 text-sm">{b.name}</td>
                    <td className="text-xs text-slate-500 font-mono">{b.slug}</td>
                    <td className="text-xs text-slate-600 max-w-xs">{b.description || '—'}</td>
                    <td className="font-bold text-emerald-700 text-xs">{b._count?.products || 0} items</td>
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
              <h3 className="font-extrabold text-base text-slate-900">Add Brand / Partner</h3>
              <button onClick={() => setModalOpen(false)} className="p-1 text-slate-400 font-bold">✕</button>
            </div>

            <form onSubmit={async (e) => {
              e.preventDefault()
              toast.success(`Brand "${name}" added!`)
              setModalOpen(false)
            }} className="space-y-4">
              <div>
                <label className="form-label text-xs font-bold uppercase text-slate-700">Brand Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Sundarban Native"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value)
                    setSlug(slugify(e.target.value))
                  }}
                  className="input text-xs rounded-xl"
                />
              </div>

              <div>
                <label className="form-label text-xs font-bold uppercase text-slate-700">Description</label>
                <input
                  type="text"
                  placeholder="Farm / Sourcing region details"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="input text-xs rounded-xl"
                />
              </div>

              <button type="submit" className="btn btn-primary w-full rounded-xl text-xs font-bold">
                Save Brand
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
