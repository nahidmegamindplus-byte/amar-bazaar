'use client'
import { useState, useEffect } from 'react'
import { Library, Upload, Image as ImageIcon, Copy } from 'lucide-react'
import toast from 'react-hot-toast'

export default function AdminMediaPage() {
  const [mediaList, setMediaList] = useState<any[]>([
    { id: '1', name: 'sundarban-honey.jpg', url: 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?auto=format&fit=crop&w=600&q=80', size: '145 KB' },
    { id: '2', name: 'mustard-oil.jpg', url: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&w=600&q=80', size: '190 KB' },
    { id: '3', name: 'organic-ghee.jpg', url: 'https://images.unsplash.com/photo-1628088062854-d1870b4553da?auto=format&fit=crop&w=600&q=80', size: '210 KB' },
    { id: '4', name: 'ajwa-dates.jpg', url: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&w=600&q=80', size: '175 KB' },
    { id: '5', name: 'chia-seeds.jpg', url: 'https://images.unsplash.com/photo-1508746829417-e6f548d8d6ed?auto=format&fit=crop&w=600&q=80', size: '160 KB' },
  ])

  const copyUrl = (url: string) => {
    navigator.clipboard.writeText(url)
    toast.success('Image URL copied to clipboard!')
  }

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">Media Library</h1>
          <p className="text-xs text-slate-500 mt-1">Uploaded product photos, banners, and marketing assets</p>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {mediaList.map((m) => (
          <div key={m.id} className="card overflow-hidden group border border-slate-100">
            <div className="aspect-square bg-slate-100 overflow-hidden relative">
              <img src={m.url} alt={m.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
              <button
                onClick={() => copyUrl(m.url)}
                className="absolute top-2 right-2 p-1.5 rounded-lg bg-white/90 shadow text-slate-700 hover:bg-emerald-600 hover:text-white transition-colors"
                title="Copy Image URL"
              >
                <Copy size={13} />
              </button>
            </div>
            <div className="p-2.5">
              <div className="text-xs font-bold text-slate-800 line-clamp-1">{m.name}</div>
              <div className="text-[10px] text-slate-400">{m.size}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
