'use client'
import { useState, useEffect } from 'react'
import { Image as ImageIcon, Plus, Edit, Trash2 } from 'lucide-react'
import toast from 'react-hot-toast'

export default function AdminBannersPage() {
  const [banners, setBanners] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)

  const [title, setTitle] = useState('')
  const [heading, setHeading] = useState('')
  const [subheading, setSubheading] = useState('')
  const [image, setImage] = useState('')
  const [buttonText, setButtonText] = useState('Shop Now')
  const [buttonUrl, setButtonUrl] = useState('/shop')

  const fetchBanners = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/banners')
      const data = await res.json()
      if (data.success) setBanners(data.data)
    } catch {
      // fallback
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchBanners()
  }, [])

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">Banners & Sliders</h1>
          <p className="text-xs text-slate-500 mt-1">Manage homepage hero slides and promotional showcase graphics</p>
        </div>
        <button
          onClick={() => setModalOpen(true)}
          className="btn btn-primary btn-sm rounded-xl flex items-center gap-1.5 self-start"
        >
          <Plus size={15} />
          <span>Add New Banner</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {banners.map((b) => (
          <div key={b.id} className="card overflow-hidden">
            <div className="relative aspect-video bg-slate-900 overflow-hidden">
              <img src={b.image} alt={b.title || 'Banner'} className="w-full h-full object-cover opacity-80" />
              <div className="absolute inset-0 p-6 flex flex-col justify-end text-white">
                <span className="text-amber-400 font-bold text-xs">{b.title}</span>
                <h3 className="text-lg font-bold">{b.heading}</h3>
                <p className="text-xs text-slate-300 line-clamp-1">{b.subheading}</p>
              </div>
            </div>
            <div className="p-4 flex items-center justify-between">
              <span className="badge badge-green text-xs">Active</span>
              <button
                onClick={async () => {
                  await fetch(`/api/admin/banners?id=${b.id}`, { method: 'DELETE' })
                  toast.success('Banner removed')
                  fetchBanners()
                }}
                className="btn btn-ghost btn-sm text-rose-500 text-xs"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 md:p-8 max-w-md w-full space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="font-extrabold text-base text-slate-900">Add Hero Banner</h3>
              <button onClick={() => setModalOpen(false)} className="p-1 text-slate-400 font-bold">✕</button>
            </div>

            <form onSubmit={async (e) => {
              e.preventDefault()
              const res = await fetch('/api/admin/banners', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ title, heading, subheading, image, buttonText, buttonUrl, type: 'HERO', isActive: true })
              })
              if (res.ok) {
                toast.success('Banner added')
                setModalOpen(false)
                fetchBanners()
              }
            }} className="space-y-4">
              <div>
                <label className="form-label text-xs font-bold uppercase text-slate-700">Small Tagline</label>
                <input type="text" placeholder="e.g. 100% Pure Organic" value={title} onChange={e => setTitle(e.target.value)} className="input text-xs rounded-xl" />
              </div>
              <div>
                <label className="form-label text-xs font-bold uppercase text-slate-700">Main Heading *</label>
                <input type="text" required placeholder="e.g. Pure Honey from Sundarban" value={heading} onChange={e => setHeading(e.target.value)} className="input text-xs rounded-xl" />
              </div>
              <div>
                <label className="form-label text-xs font-bold uppercase text-slate-700">Image URL *</label>
                <input type="url" required placeholder="https://..." value={image} onChange={e => setImage(e.target.value)} className="input text-xs rounded-xl" />
              </div>
              <button type="submit" className="btn btn-primary w-full rounded-xl text-xs font-bold">Save Banner</button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
