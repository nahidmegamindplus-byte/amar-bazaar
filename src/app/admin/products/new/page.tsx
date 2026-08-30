'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Package, ArrowLeft, Upload, Save, CheckCircle2, Image as ImageIcon } from 'lucide-react'
import { slugify } from '@/lib/utils'
import ImageUploader from '@/components/admin/ImageUploader'
import toast from 'react-hot-toast'

export default function AdminNewProductPage() {
  const router = useRouter()
  const [categories, setCategories] = useState<any[]>([])
  const [brands, setBrands] = useState<any[]>([])
  const [submitting, setSubmitting] = useState(false)

  // Form fields
  const [name, setName] = useState('')
  const [slug, setSlug] = useState('')
  const [sku, setSku] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [brandId, setBrandId] = useState('')
  const [shortDesc, setShortDesc] = useState('')
  const [description, setDescription] = useState('')
  const [thumbnail, setThumbnail] = useState('')
  const [regularPrice, setRegularPrice] = useState('')
  const [salePrice, setSalePrice] = useState('')
  const [stock, setStock] = useState('50')
  const [unit, setUnit] = useState('500g Jar')
  const [isOrganic, setIsOrganic] = useState(true)
  const [isFeatured, setIsFeatured] = useState(false)
  const [isFlashSale, setIsFlashSale] = useState(false)
  const [isPublished, setIsPublished] = useState(true)

  useEffect(() => {
    fetch('/api/categories').then(r => r.json()).then(d => { if (d.success) setCategories(d.data) })
    fetch('/api/brands').then(r => r.json()).then(d => { if (d.success) setBrands(d.data) })
  }, [])

  const handleNameChange = (val: string) => {
    setName(val)
    if (!slug || slug === slugify(name)) {
      setSlug(slugify(val))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return toast.error('Product name required')
    if (!regularPrice || parseFloat(regularPrice) <= 0) return toast.error('Valid regular price required')

    setSubmitting(true)
    try {
      const payload = {
        name,
        slug: slug || slugify(name),
        sku: sku || undefined,
        categoryId: categoryId || undefined,
        brandId: brandId || undefined,
        shortDesc,
        description,
        thumbnail: thumbnail || 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=600&q=80',
        regularPrice: parseFloat(regularPrice),
        salePrice: salePrice ? parseFloat(salePrice) : null,
        stock: parseInt(stock) || 0,
        unit,
        isOrganic,
        isFeatured,
        isFlashSale,
        isPublished,
      }

      const res = await fetch('/api/admin/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      const data = await res.json()
      if (res.ok && data.success) {
        toast.success('Product created successfully!')
        router.push('/admin/products')
      } else {
        toast.error(data.error || 'Failed to create product')
      }
    } catch {
      toast.error('Error creating product')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center gap-3">
        <Link href="/admin/products" className="btn btn-ghost btn-sm p-1.5 text-slate-500 hover:text-slate-900">
          <ArrowLeft size={18} />
        </Link>
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">Add New Product</h1>
          <p className="text-xs text-slate-500 mt-0.5">Create a new organic product listing in your catalog</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* 1. Basic Info */}
        <div className="card p-6 space-y-4">
          <h3 className="font-extrabold text-sm text-slate-800 border-b border-slate-100 pb-2">
            1. Basic Information
          </h3>

          <div>
            <label className="form-label text-xs font-bold uppercase text-slate-700">Product Name *</label>
            <input
              type="text"
              required
              placeholder="e.g. Sundarban Raw Wild Honey (মধু)"
              value={name}
              onChange={(e) => handleNameChange(e.target.value)}
              className="input text-sm rounded-xl"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="form-label text-xs font-bold uppercase text-slate-700">URL Slug *</label>
              <input
                type="text"
                required
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                className="input text-xs rounded-xl"
              />
            </div>
            <div>
              <label className="form-label text-xs font-bold uppercase text-slate-700">SKU Code</label>
              <input
                type="text"
                placeholder="e.g. SB-HNY-001"
                value={sku}
                onChange={(e) => setSku(e.target.value)}
                className="input text-xs rounded-xl"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="form-label text-xs font-bold uppercase text-slate-700">Category</label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="select text-xs rounded-xl bg-white"
              >
                <option value="">Select Category</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="form-label text-xs font-bold uppercase text-slate-700">Brand / Source</label>
              <select
                value={brandId}
                onChange={(e) => setBrandId(e.target.value)}
                className="select text-xs rounded-xl bg-white"
              >
                <option value="">Select Brand</option>
                {brands.map((b) => (
                  <option key={b.id} value={b.id}>{b.name}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* 2. Pricing & Stock */}
        <div className="card p-6 space-y-4">
          <h3 className="font-extrabold text-sm text-slate-800 border-b border-slate-100 pb-2">
            2. Pricing, Inventory & Packaging
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="form-label text-xs font-bold uppercase text-slate-700">Regular Price (৳) *</label>
              <input
                type="number"
                required
                min="0"
                placeholder="e.g. 850"
                value={regularPrice}
                onChange={(e) => setRegularPrice(e.target.value)}
                className="input text-sm rounded-xl font-bold"
              />
            </div>
            <div>
              <label className="form-label text-xs font-bold uppercase text-slate-700">Sale Discount Price (৳)</label>
              <input
                type="number"
                min="0"
                placeholder="e.g. 750"
                value={salePrice}
                onChange={(e) => setSalePrice(e.target.value)}
                className="input text-sm rounded-xl font-bold text-emerald-700"
              />
            </div>
            <div>
              <label className="form-label text-xs font-bold uppercase text-slate-700">Initial Stock *</label>
              <input
                type="number"
                required
                min="0"
                value={stock}
                onChange={(e) => setStock(e.target.value)}
                className="input text-sm rounded-xl"
              />
            </div>
          </div>

          <div>
            <label className="form-label text-xs font-bold uppercase text-slate-700">Packaging Unit (ওজন / প্যাকেজিং)</label>
            <input
              type="text"
              placeholder="e.g. 500g Jar, 1 Litre Bottle, 250g Pouch"
              value={unit}
              onChange={(e) => setUnit(e.target.value)}
              className="input text-xs rounded-xl"
            />
          </div>
        </div>

        {/* 3. Media & Description */}
        <div className="card p-6 space-y-4">
          <h3 className="font-extrabold text-sm text-slate-800 border-b border-slate-100 pb-2">
            3. Product Media & Descriptions
          </h3>

          <ImageUploader
            label="Product Main Thumbnail Image (মূল ছবি)"
            value={thumbnail}
            onChange={setThumbnail}
            folder="products"
            aspectRatio="square"
            helperText="Upload a square high-quality product photo (JPG, PNG, WebP) or paste an image URL."
          />

          <div>
            <label className="form-label text-xs font-bold uppercase text-slate-700">Short Summary</label>
            <input
              type="text"
              placeholder="Brief 1-line highlight"
              value={shortDesc}
              onChange={(e) => setShortDesc(e.target.value)}
              className="input text-xs rounded-xl"
            />
          </div>

          <div>
            <label className="form-label text-xs font-bold uppercase text-slate-700">Full Description</label>
            <textarea
              rows={4}
              placeholder="Detailed organic source, nutritional benefits, harvest technique..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="input text-xs rounded-xl"
            />
          </div>
        </div>

        {/* 4. Flags & Visibility */}
        <div className="card p-6 space-y-4">
          <h3 className="font-extrabold text-sm text-slate-800 border-b border-slate-100 pb-2">
            4. Flags & Visibility
          </h3>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <label className="flex items-center gap-2 text-xs font-semibold cursor-pointer">
              <input
                type="checkbox"
                checked={isOrganic}
                onChange={(e) => setIsOrganic(e.target.checked)}
                className="rounded text-emerald-600"
              />
              <span>100% Organic</span>
            </label>

            <label className="flex items-center gap-2 text-xs font-semibold cursor-pointer">
              <input
                type="checkbox"
                checked={isFeatured}
                onChange={(e) => setIsFeatured(e.target.checked)}
                className="rounded text-emerald-600"
              />
              <span>Featured</span>
            </label>

            <label className="flex items-center gap-2 text-xs font-semibold cursor-pointer">
              <input
                type="checkbox"
                checked={isFlashSale}
                onChange={(e) => setIsFlashSale(e.target.checked)}
                className="rounded text-emerald-600"
              />
              <span>Flash Sale</span>
            </label>

            <label className="flex items-center gap-2 text-xs font-semibold cursor-pointer">
              <input
                type="checkbox"
                checked={isPublished}
                onChange={(e) => setIsPublished(e.target.checked)}
                className="rounded text-emerald-600"
              />
              <span>Published (Live)</span>
            </label>
          </div>
        </div>

        {/* Save button */}
        <div className="flex gap-3">
          <button
            type="submit"
            disabled={submitting}
            className="btn btn-primary btn-lg rounded-2xl font-extrabold text-sm flex items-center gap-2 shadow-md shadow-emerald-700/20"
          >
            <Save size={16} />
            <span>{submitting ? 'Saving Product...' : 'Save & Publish Product'}</span>
          </button>

          <Link href="/admin/products" className="btn btn-ghost btn-lg rounded-2xl text-xs font-semibold">
            Cancel
          </Link>
        </div>
      </form>
    </div>
  )
}
