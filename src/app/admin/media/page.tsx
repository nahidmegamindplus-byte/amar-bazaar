'use client'
import { useState, useEffect, useRef } from 'react'
import {
  Library, Upload, Image as ImageIcon, Copy, Trash2, Search,
  Filter, RefreshCw, Check, Eye, X, Folder, Sparkles
} from 'lucide-react'
import toast from 'react-hot-toast'

export default function AdminMediaPage() {
  const [mediaList, setMediaList] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [search, setSearch] = useState('')
  const [selectedFolder, setSelectedFolder] = useState('all')
  const [previewImage, setPreviewImage] = useState<any>(null)
  const [dragOver, setDragOver] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const fetchMedia = async () => {
    setLoading(true)
    try {
      let url = '/api/admin/media?'
      if (selectedFolder !== 'all') url += `folder=${encodeURIComponent(selectedFolder)}&`
      if (search.trim()) url += `search=${encodeURIComponent(search.trim())}&`

      const res = await fetch(url)
      const data = await res.json()
      if (data.success && data.data) {
        setMediaList(data.data)
      }
    } catch {
      toast.error('Failed to load media library')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchMedia()
  }, [selectedFolder, search])

  const handleUploadFiles = async (files: FileList | File[]) => {
    if (!files || files.length === 0) return

    setUploading(true)
    let uploadedCount = 0
    const toastId = toast.loading(`Uploading ${files.length} image(s)...`)

    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      if (!file.type.startsWith('image/')) continue

      try {
        const formData = new FormData()
        formData.append('file', file)
        formData.append('folder', selectedFolder !== 'all' ? selectedFolder : 'products')

        const res = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        })

        if (res.ok) {
          uploadedCount++
        }
      } catch (err) {
        console.error('File upload error:', err)
      }
    }

    setUploading(false)
    if (uploadedCount > 0) {
      toast.success(`Successfully uploaded ${uploadedCount} image(s)! 🎉`, { id: toastId })
      fetchMedia()
    } else {
      toast.error('Upload failed or invalid image format.', { id: toastId })
    }
  }

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete "${name}"?`)) return

    try {
      const res = await fetch(`/api/admin/media?id=${id}`, { method: 'DELETE' })
      if (res.ok) {
        toast.success('Media asset deleted')
        setMediaList((prev) => prev.filter((m) => m.id !== id))
      } else {
        toast.error('Failed to delete media')
      }
    } catch {
      toast.error('Error deleting media')
    }
  }

  const copyUrl = (url: string) => {
    navigator.clipboard.writeText(url)
    toast.success('Image URL copied to clipboard!')
  }

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return '120 KB'
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB'
  }

  return (
    <div className="space-y-6 max-w-6xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 flex items-center gap-2">
            <Library className="text-emerald-600" size={26} />
            <span>Media Library (মিডিয়া গ্যালারি)</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">Upload, manage, and reuse product photos, hero banners, and marketing assets</p>
        </div>

        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="btn btn-primary btn-sm rounded-xl font-bold flex items-center gap-2 shadow-md shadow-emerald-700/20 cursor-pointer self-start sm:self-auto"
        >
          {uploading ? (
            <RefreshCw size={15} className="animate-spin" />
          ) : (
            <Upload size={15} />
          )}
          <span>{uploading ? 'Uploading...' : 'Upload Images (ছবি আপলোড)'}</span>
        </button>
      </div>

      {/* Drag & Drop Upload Banner */}
      <div
        onDragOver={(e) => {
          e.preventDefault()
          setDragOver(true)
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault()
          setDragOver(false)
          if (e.dataTransfer.files) {
            handleUploadFiles(e.dataTransfer.files)
          }
        }}
        onClick={() => fileInputRef.current?.click()}
        className={`border-2 border-dashed rounded-3xl p-6 sm:p-8 text-center cursor-pointer transition-all duration-200 flex flex-col items-center justify-center gap-2.5 ${
          dragOver
            ? 'border-emerald-500 bg-emerald-50 scale-[1.01] shadow-lg'
            : 'border-slate-300 hover:border-emerald-500 bg-white hover:bg-emerald-50/20 shadow-xs'
        }`}
      >
        <div className="w-14 h-14 rounded-2xl bg-emerald-100/80 text-emerald-700 flex items-center justify-center shadow-xs">
          <Upload size={26} />
        </div>
        <div className="space-y-0.5">
          <h3 className="font-extrabold text-sm text-slate-800">
            Drag & Drop images here, or <span className="text-emerald-600 underline">Browse Files</span>
          </h3>
          <p className="text-xs text-slate-400">
            Upload single or multiple images (PNG, JPG, WebP, GIF, SVG up to 10MB each)
          </p>
        </div>
      </div>

      {/* Hidden Multi-file input */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/jpeg,image/png,image/webp,image/gif,image/svg+xml"
        onChange={(e) => {
          if (e.target.files) {
            handleUploadFiles(e.target.files)
          }
        }}
        className="hidden"
      />

      {/* Controls Bar (Search & Folder Filter) */}
      <div className="card p-3.5 flex flex-col sm:flex-row items-center justify-between gap-3 bg-white">
        {/* Search */}
        <div className="relative w-full sm:w-72">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search images by name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input text-xs pl-9 py-2 rounded-xl bg-slate-50 border-slate-200"
          />
        </div>

        {/* Folder Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          {[
            { id: 'all', label: 'All Files' },
            { id: 'products', label: 'Products' },
            { id: 'banners', label: 'Banners' },
            { id: 'categories', label: 'Categories' },
            { id: 'general', label: 'General' },
          ].map((f) => (
            <button
              key={f.id}
              onClick={() => setSelectedFolder(f.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer shrink-0 ${
                selectedFolder === f.id
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Media Grid */}
      {loading ? (
        <div className="py-16 text-center text-xs text-slate-400 space-y-2">
          <RefreshCw size={24} className="animate-spin mx-auto text-emerald-600" />
          <p>Loading media library assets...</p>
        </div>
      ) : mediaList.length === 0 ? (
        <div className="card p-12 text-center space-y-3 bg-white">
          <ImageIcon size={44} className="mx-auto text-slate-300" />
          <h3 className="font-bold text-sm text-slate-800">No media assets found</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Upload photos from your computer to use in products, banners, and categories.
          </p>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="btn btn-primary btn-sm rounded-xl font-bold text-xs"
          >
            Upload Images Now
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {mediaList.map((m) => (
            <div
              key={m.id}
              className="card overflow-hidden group border border-slate-100 shadow-xs hover:shadow-md hover:border-emerald-500/40 transition-all bg-white flex flex-col justify-between"
            >
              {/* Image Thumbnail */}
              <div className="aspect-square bg-slate-100 overflow-hidden relative">
                <img
                  src={m.url}
                  alt={m.originalName || m.filename}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  loading="lazy"
                />

                {/* Hover Action Overlay */}
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 p-2">
                  <button
                    type="button"
                    onClick={() => setPreviewImage(m)}
                    className="p-2 rounded-xl bg-white/90 text-slate-700 hover:bg-white hover:text-emerald-700 shadow-xs transition-colors cursor-pointer"
                    title="View preview"
                  >
                    <Eye size={15} />
                  </button>

                  <button
                    type="button"
                    onClick={() => copyUrl(m.url)}
                    className="p-2 rounded-xl bg-white/90 text-slate-700 hover:bg-emerald-600 hover:text-white shadow-xs transition-colors cursor-pointer"
                    title="Copy Image URL"
                  >
                    <Copy size={15} />
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDelete(m.id, m.originalName || m.filename)}
                    className="p-2 rounded-xl bg-white/90 text-slate-700 hover:bg-rose-600 hover:text-white shadow-xs transition-colors cursor-pointer"
                    title="Delete Image"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>

              {/* Card Meta Footer */}
              <div className="p-2.5 space-y-1">
                <div className="text-xs font-bold text-slate-800 truncate" title={m.originalName || m.filename}>
                  {m.originalName || m.filename}
                </div>
                <div className="flex items-center justify-between text-[10px] text-slate-400">
                  <span>{formatFileSize(m.size)}</span>
                  <span className="uppercase font-semibold tracking-wider text-[9px] bg-slate-100 px-1.5 py-0.2 rounded text-slate-500">
                    {m.folder || 'general'}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Full Image Preview Modal */}
      {previewImage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-fadeIn">
          <div className="relative max-w-3xl w-full bg-white rounded-3xl overflow-hidden shadow-2xl p-5 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="min-w-0 pr-4">
                <h3 className="font-extrabold text-sm text-slate-900 truncate">
                  {previewImage.originalName || previewImage.filename}
                </h3>
                <p className="text-[11px] text-slate-400">
                  Size: {formatFileSize(previewImage.size)} • Folder: {previewImage.folder}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setPreviewImage(null)}
                className="p-1.5 text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            <div className="max-h-[60vh] overflow-auto flex items-center justify-center bg-slate-50 rounded-2xl p-2">
              <img
                src={previewImage.url}
                alt={previewImage.originalName}
                className="max-h-[55vh] object-contain rounded-xl"
              />
            </div>

            {/* URL bar & actions */}
            <div className="flex items-center gap-2 pt-1">
              <input
                type="text"
                readOnly
                value={previewImage.url}
                className="input text-xs font-mono bg-slate-50 rounded-xl flex-1 select-all"
              />
              <button
                type="button"
                onClick={() => copyUrl(previewImage.url)}
                className="btn btn-primary btn-sm rounded-xl text-xs font-bold flex items-center gap-1.5 px-4 cursor-pointer"
              >
                <Copy size={13} />
                <span>Copy URL</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
