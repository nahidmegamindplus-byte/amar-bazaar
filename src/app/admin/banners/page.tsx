'use client'
import { useState, useEffect } from 'react'
import { Image as ImageIcon, Plus, Edit, Trash2, X, Sparkles } from 'lucide-react'
import ImageUploader from '@/components/admin/ImageUploader'
import toast from 'react-hot-toast'

export default function AdminBannersPage() {
  const [banners, setBanners] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)

  const [title, setTitle] = useState('')
  const [heading, setHeading] = useState('')
  const [subheading, setSubheading] = useState('')
  const [image, setImage] = useState('')
  const [buttonText, setButtonText] = useState('Shop Organic Now')
  const [buttonUrl, setButtonUrl] = useState('/shop')
  const [submitting, setSubmitting] = useState(false)

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

  const handleOpenModal = () => {
    setTitle('')
    setHeading('')
    setSubheading('')
    setImage('')
    setButtonText('Shop Organic Now')
    setButtonUrl('/shop')
    setModalOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!image.trim()) return toast.error('Please upload or provide a banner image')
    if (!heading.trim()) return toast.error('Please provide a banner heading')

    setSubmitting(true)
    try {
      const res = await fetch('/api/admin/banners', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          heading,
          subheading,
          image,
          buttonText,
          buttonUrl,
          type: 'HERO',
          isActive: true
        })
      })

      if (res.ok) {
        toast.success('Hero Banner created successfully!')
        setModalOpen(false)
        fetchBanners()
      } else {
        toast.error('Failed to create banner')
      }
    } catch {
      toast.error('Error creating banner')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="space-y-6 max-w-6xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">Banners & Sliders</h1>
          <p className="text-xs text-slate-500 mt-1">Manage homepage hero slides and promotional showcase graphics</p>
        </div>
        <button
          onClick={handleOpenModal}
          className="btn btn-primary btn-sm rounded-xl flex items-center gap-1.5 self-start cursor-pointer"
        >
          <Plus size={15} />
          <span>Add New Banner</span>
        </button>
      </div>

      {loading ? (
        <div className="py-12 text-center text-xs text-slate-400">Loading banners...</div>
      ) : banners.length === 0 ? (
        <div className="card p-12 text-center space-y-3 bg-white">
          <ImageIcon size={36} className="mx-auto text-slate-300" />
          <h3 className="font-bold text-sm text-slate-800">No Banners Found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">Create promotional banners to showcase special discounts and featured products on your homepage.</p>
          <button onClick={handleOpenModal} className="btn btn-primary btn-sm rounded-xl text-xs font-bold">
            Create First Banner
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {banners.map((b) => (
            <div key={b.id} className="card overflow-hidden border border-slate-100 shadow-xs hover:shadow-md transition-shadow">
              <div className="relative aspect-[16/8] bg-slate-950 overflow-hidden">
                <img src={b.image} alt={b.title || 'Banner'} className="w-full h-full object-cover opacity-75" />
                <div className="absolute inset-0 p-5 flex flex-col justify-end text-white bg-gradient-to-t from-black/80 via-transparent to-transparent">
                  {b.title && <span className="text-amber-400 font-bold text-xs">{b.title}</span>}
                  <h3 className="text-base font-bold leading-tight drop-shadow">{b.heading}</h3>
                  {b.subheading && <p className="text-xs text-slate-300 line-clamp-1 mt-0.5">{b.subheading}</p>}
                </div>
              </div>
              <div className="p-3.5 flex items-center justify-between bg-white border-t border-slate-100">
                <span className="badge badge-green text-[11px] font-semibold">Active Hero Slide</span>
                <button
                  onClick={async () => {
                    if (!confirm('Are you sure you want to delete this banner?')) return
                    await fetch(`/api/admin/banners?id=${b.id}`, { method: 'DELETE' })
                    toast.success('Banner removed')
                    fetchBanners()
                  }}
                  className="btn btn-ghost btn-sm text-rose-600 hover:text-rose-700 hover:bg-rose-50 text-xs flex items-center gap-1 cursor-pointer"
                >
                  <Trash2 size={13} />
                  <span>Delete</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Banner Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-3xl p-6 md:p-8 max-w-lg w-full space-y-4 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-extrabold text-base text-slate-900">Add Hero Banner</h3>
              <button onClick={() => setModalOpen(false)} className="p-1 text-slate-400 hover:text-slate-700 cursor-pointer">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Professional Image Uploader for Banner */}
              <ImageUploader
                label="Banner Graphic Image *"
                value={image}
                onChange={setImage}
                folder="banners"
                aspectRatio="banner"
                helperText="Recommended size: 1600x600px (Wide landscape) or 1200x500px."
                required
              />

              <div>
                <label className="form-label text-xs font-bold uppercase text-slate-700">Small Tagline / Badge</label>
                <input
                  type="text"
                  placeholder="e.g. 100% Pure Organic Living"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="input text-xs rounded-xl"
                />
              </div>

              <div>
                <label className="form-label text-xs font-bold uppercase text-slate-700">Main Banner Heading *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Pure & Natural Grocery Directly From Farmers"
                  value={heading}
                  onChange={(e) => setHeading(e.target.value)}
                  className="input text-xs rounded-xl font-bold"
                />
              </div>

              <div>
                <label className="form-label text-xs font-bold uppercase text-slate-700">Subheading / Description</label>
                <textarea
                  rows={2}
                  placeholder="e.g. Enjoy genuine taste, zero chemicals & guaranteed freshness across Bangladesh."
                  value={subheading}
                  onChange={(e) => setSubheading(e.target.value)}
                  className="input text-xs rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="form-label text-xs font-bold uppercase text-slate-700">Button Text</label>
                  <input
                    type="text"
                    value={buttonText}
                    onChange={(e) => setButtonText(e.target.value)}
                    className="input text-xs rounded-xl"
                  />
                </div>
                <div>
                  <label className="form-label text-xs font-bold uppercase text-slate-700">Button URL</label>
                  <input
                    type="text"
                    value={buttonUrl}
                    onChange={(e) => setButtonUrl(e.target.value)}
                    className="input text-xs rounded-xl"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="btn btn-ghost flex-1 rounded-xl text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="btn btn-primary flex-1 rounded-xl text-xs font-bold cursor-pointer"
                >
                  {submitting ? 'Saving...' : 'Save & Publish Banner'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
