'use client'
import { useState, useRef, useEffect } from 'react'
import {
  Upload, Image as ImageIcon, Link as LinkIcon, X, Check,
  Library, RefreshCw, AlertCircle, Eye, Sparkles
} from 'lucide-react'
import toast from 'react-hot-toast'

interface ImageUploaderProps {
  value: string
  onChange: (url: string) => void
  label?: string
  folder?: string
  aspectRatio?: 'square' | 'video' | 'banner' | 'auto'
  helperText?: string
  required?: boolean
}

export default function ImageUploader({
  value,
  onChange,
  label = 'Image',
  folder = 'products',
  aspectRatio = 'square',
  helperText,
  required = false,
}: ImageUploaderProps) {
  const [activeTab, setActiveTab] = useState<'upload' | 'url' | 'library'>('upload')
  const [dragOver, setDragOver] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [urlInput, setUrlInput] = useState(value || '')
  const [mediaList, setMediaList] = useState<any[]>([])
  const [loadingMedia, setLoadingMedia] = useState(false)
  const [previewModal, setPreviewModal] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    setUrlInput(value || '')
  }, [value])

  const fetchMedia = async () => {
    setLoadingMedia(true)
    try {
      const res = await fetch('/api/admin/media')
      const data = await res.json()
      if (data.success && data.data) {
        setMediaList(data.data)
      }
    } catch {
      // Fallback
    } finally {
      setLoadingMedia(false)
    }
  }

  const handleFileSelect = async (file: File) => {
    if (!file) return

    // Validations
    if (!file.type.startsWith('image/')) {
      toast.error('Please select a valid image file (JPG, PNG, WebP, SVG)')
      return
    }
    if (file.size > 10 * 1024 * 1024) {
      toast.error('File size exceeds 10MB limit')
      return
    }

    setUploading(true)
    const toastId = toast.loading('Uploading image...')
    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('folder', folder)

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })

      const data = await res.json()
      if (res.ok && data.success) {
        const uploadedUrl = data.data.url
        onChange(uploadedUrl)
        setUrlInput(uploadedUrl)
        toast.success('Image uploaded successfully! 🎉', { id: toastId })
      } else {
        toast.error(data.error || 'Failed to upload image', { id: toastId })
      }
    } catch {
      toast.error('Upload failed. Please try again.', { id: toastId })
    } finally {
      setUploading(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0])
    }
  }

  const handleApplyUrl = (e: React.FormEvent) => {
    e.preventDefault()
    if (!urlInput.trim()) {
      toast.error('Please enter an image URL')
      return
    }
    onChange(urlInput.trim())
    toast.success('Image URL applied!')
  }

  const handleRemove = () => {
    onChange('')
    setUrlInput('')
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const getAspectClass = () => {
    switch (aspectRatio) {
      case 'video': return 'aspect-video'
      case 'banner': return 'aspect-[16/7] min-h-[140px]'
      case 'square': return 'aspect-square max-w-[220px]'
      default: return 'aspect-square max-w-[220px]'
    }
  }

  return (
    <div className="space-y-2">
      {/* Label Header */}
      <div className="flex items-center justify-between">
        <label className="form-label text-xs font-bold uppercase text-slate-700 mb-0">
          {label} {required && <span className="text-rose-500">*</span>}
        </label>
        {value && (
          <button
            type="button"
            onClick={handleRemove}
            className="text-[11px] text-rose-500 hover:text-rose-700 font-semibold flex items-center gap-0.5 cursor-pointer"
          >
            <X size={13} />
            <span>Remove Image</span>
          </button>
        )}
      </div>

      {/* Main Container */}
      <div className="bg-slate-50/70 border border-slate-200/90 rounded-2xl p-3.5 space-y-3">
        {/* If Image is Selected -> Show Rich Preview Card */}
        {value ? (
          <div className="flex flex-col sm:flex-row items-center gap-4 bg-white p-3 rounded-xl border border-slate-100 shadow-xs">
            {/* Image Preview Box */}
            <div className={`relative ${getAspectClass()} w-full sm:w-auto rounded-lg overflow-hidden bg-slate-100 border border-slate-200 shrink-0 group`}>
              <img
                src={value}
                alt="Selected asset preview"
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=400&q=80'
                }}
              />
              <button
                type="button"
                onClick={() => setPreviewModal(true)}
                className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white cursor-pointer"
                title="View full image"
              >
                <Eye size={20} />
              </button>
            </div>

            {/* Image Info & Actions */}
            <div className="flex-1 min-w-0 space-y-2 text-center sm:text-left">
              <div className="flex items-center justify-center sm:justify-start gap-1.5 text-emerald-700 text-xs font-bold">
                <Check size={14} />
                <span>Image Attached</span>
              </div>
              <p className="text-[11px] font-mono text-slate-500 truncate max-w-xs sm:max-w-sm bg-slate-50 p-1.5 rounded-lg border border-slate-100 select-all">
                {value}
              </p>
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="btn btn-outline btn-sm rounded-lg text-xs font-semibold py-1 px-2.5 flex items-center gap-1 cursor-pointer"
                >
                  <RefreshCw size={12} />
                  <span>Upload Different Image</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('library')
                    fetchMedia()
                  }}
                  className="btn btn-ghost btn-sm text-slate-600 hover:text-emerald-700 rounded-lg text-xs font-semibold py-1 px-2.5 flex items-center gap-1 cursor-pointer"
                >
                  <Library size={13} />
                  <span>Choose from Library</span>
                </button>
              </div>
            </div>
          </div>
        ) : (
          <>
            {/* Mode Switcher Tabs */}
            <div className="flex items-center gap-1 p-1 bg-slate-200/60 rounded-xl max-w-fit text-xs font-bold text-slate-600">
              <button
                type="button"
                onClick={() => setActiveTab('upload')}
                className={`py-1 px-3 rounded-lg flex items-center gap-1.5 transition-all cursor-pointer ${
                  activeTab === 'upload' ? 'bg-white text-emerald-700 shadow-xs' : 'hover:text-slate-900'
                }`}
              >
                <Upload size={13} />
                <span>Upload File (ফাইল আপলোড)</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('url')}
                className={`py-1 px-3 rounded-lg flex items-center gap-1.5 transition-all cursor-pointer ${
                  activeTab === 'url' ? 'bg-white text-emerald-700 shadow-xs' : 'hover:text-slate-900'
                }`}
              >
                <LinkIcon size={13} />
                <span>Image URL (লিংক)</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setActiveTab('library')
                  fetchMedia()
                }}
                className={`py-1 px-3 rounded-lg flex items-center gap-1.5 transition-all cursor-pointer ${
                  activeTab === 'library' ? 'bg-white text-emerald-700 shadow-xs' : 'hover:text-slate-900'
                }`}
              >
                <Library size={13} />
                <span>Media Library (মিডিয়া)</span>
              </button>
            </div>

            {/* Tab 1: Drag & Drop File Upload */}
            {activeTab === 'upload' && (
              <div
                onDragOver={(e) => {
                  e.preventDefault()
                  setDragOver(true)
                }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`relative border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-2.5 ${
                  dragOver
                    ? 'border-emerald-500 bg-emerald-50/70 scale-[1.01]'
                    : 'border-slate-300 hover:border-emerald-500 hover:bg-white bg-slate-50/50'
                }`}
              >
                <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center shadow-xs">
                  {uploading ? (
                    <RefreshCw size={22} className="animate-spin text-emerald-600" />
                  ) : (
                    <Upload size={22} />
                  )}
                </div>

                <div className="space-y-0.5">
                  <p className="text-xs font-bold text-slate-800">
                    {uploading ? 'Uploading image, please wait...' : 'Click to upload or drag & drop image'}
                  </p>
                  <p className="text-[11px] text-slate-400">
                    Supports PNG, JPG, WebP, GIF, SVG up to 10MB
                  </p>
                </div>

                <button
                  type="button"
                  disabled={uploading}
                  className="btn btn-primary btn-sm rounded-xl text-xs font-bold py-1.5 px-3.5 shadow-xs mt-1 pointer-events-none"
                >
                  {uploading ? 'Uploading...' : 'Browse Image'}
                </button>
              </div>
            )}

            {/* Tab 2: Direct Image URL */}
            {activeTab === 'url' && (
              <form onSubmit={handleApplyUrl} className="space-y-2 pt-1">
                <div className="flex gap-2">
                  <input
                    type="url"
                    placeholder="https://example.com/images/product.jpg"
                    value={urlInput}
                    onChange={(e) => setUrlInput(e.target.value)}
                    className="input text-xs rounded-xl bg-white flex-1"
                    autoFocus
                  />
                  <button
                    type="submit"
                    className="btn btn-primary btn-sm rounded-xl text-xs font-bold px-4 shrink-0 cursor-pointer"
                  >
                    Apply URL
                  </button>
                </div>
                <p className="text-[10px] text-slate-400">
                  Paste a direct public image link (Unsplash, Cloudinary, AWS S3, etc.)
                </p>
              </form>
            )}

            {/* Tab 3: Media Library Picker */}
            {activeTab === 'library' && (
              <div className="space-y-2.5 pt-1">
                <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                  <span>Select from Media Library:</span>
                  <button
                    type="button"
                    onClick={fetchMedia}
                    className="text-emerald-600 hover:text-emerald-700 text-[11px] flex items-center gap-1 cursor-pointer"
                  >
                    <RefreshCw size={11} className={loadingMedia ? 'animate-spin' : ''} />
                    <span>Refresh</span>
                  </button>
                </div>

                {loadingMedia ? (
                  <div className="py-8 text-center text-xs text-slate-400">
                    <RefreshCw size={18} className="animate-spin mx-auto mb-1 text-emerald-600" />
                    <span>Loading media assets...</span>
                  </div>
                ) : mediaList.length === 0 ? (
                  <div className="py-6 text-center text-xs text-slate-400 bg-white rounded-xl border border-slate-100">
                    <ImageIcon size={24} className="mx-auto mb-1 text-slate-300" />
                    <p>No uploaded media yet.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2 max-h-48 overflow-y-auto p-1 bg-white rounded-xl border border-slate-100">
                    {mediaList.map((m) => (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => {
                          onChange(m.url)
                          setUrlInput(m.url)
                          toast.success('Image selected from library!')
                        }}
                        className="group relative aspect-square rounded-lg overflow-hidden border border-slate-200 hover:border-emerald-500 hover:shadow-xs transition-all cursor-pointer bg-slate-50"
                      >
                        <img src={m.url} alt={m.originalName || m.filename} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                        <div className="absolute inset-0 bg-emerald-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-[10px] font-bold">
                          Select
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </>
        )}

        {/* Hidden File Input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif,image/svg+xml"
          onChange={(e) => {
            if (e.target.files && e.target.files[0]) {
              handleFileSelect(e.target.files[0])
            }
          }}
          className="hidden"
        />

        {/* Helper Note */}
        {helperText && (
          <p className="text-[11px] text-slate-400 leading-tight">
            💡 {helperText}
          </p>
        )}
      </div>

      {/* Full Image Preview Modal */}
      {previewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-fadeIn">
          <div className="relative max-w-2xl w-full bg-white rounded-2xl overflow-hidden shadow-2xl p-4 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <span className="font-bold text-xs text-slate-800">Image Preview</span>
              <button
                type="button"
                onClick={() => setPreviewModal(false)}
                className="p-1 text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>
            <div className="max-h-[70vh] overflow-auto flex items-center justify-center bg-slate-50 rounded-xl p-2">
              <img src={value} alt="Preview" className="max-h-[60vh] object-contain rounded-lg" />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
