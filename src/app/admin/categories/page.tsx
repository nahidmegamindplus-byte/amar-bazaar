'use client'
import { useState, useEffect } from 'react'
import { Tag, Plus, Edit, Trash2, RefreshCw } from 'lucide-react'
import { slugify } from '@/lib/utils'
import toast from 'react-hot-toast'

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editingCat, setEditingCat] = useState<any>(null)

  // Form State
  const [name, setName] = useState('')
  const [slug, setSlug] = useState('')
  const [description, setDescription] = useState('')
  const [image, setImage] = useState('')
  const [sortOrder, setSortOrder] = useState('0')
  const [submitting, setSubmitting] = useState(false)

  const fetchCategories = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/categories')
      const data = await res.json()
      if (data.success) setCategories(data.data)
    } catch {
      toast.error('Failed to load categories')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCategories()
  }, [])

  const handleOpenModal = (cat?: any) => {
    if (cat) {
      setEditingCat(cat)
      setName(cat.name)
      setSlug(cat.slug)
      setDescription(cat.description || '')
      setImage(cat.image || '')
      setSortOrder(String(cat.sortOrder || 0))
    } else {
      setEditingCat(null)
      setName('')
      setSlug('')
      setDescription('')
      setImage('')
      setSortOrder('0')
    }
    setModalOpen(true)
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return toast.error('Category name required')

    setSubmitting(true)
    try {
      const payload = {
        name,
        slug: slug || slugify(name),
        description,
        image,
        sortOrder: parseInt(sortOrder) || 0,
      }

      const url = editingCat ? '/api/admin/categories' : '/api/admin/categories'
      const method = editingCat ? 'PATCH' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingCat ? { id: editingCat.id, ...payload } : payload),
      })

      if (res.ok) {
        toast.success(editingCat ? 'Category updated' : 'Category created')
        setModalOpen(false)
        fetchCategories()
      } else {
        const d = await res.json()
        toast.error(d.error || 'Failed to save category')
      }
    } catch {
      toast.error('Error saving category')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this category?')) return
    try {
      const res = await fetch(`/api/admin/categories?id=${id}`, { method: 'DELETE' })
      if (res.ok) {
        toast.success('Category deleted')
        fetchCategories()
      } else {
        toast.error('Delete failed')
      }
    } catch {
      toast.error('Error deleting category')
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">Categories Management</h1>
          <p className="text-xs text-slate-500 mt-1">Organize your organic catalog structure and subcategories</p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="btn btn-primary btn-sm rounded-xl flex items-center gap-1.5 self-start"
        >
          <Plus size={15} />
          <span>Add Category</span>
        </button>
      </div>

      {/* Categories Table */}
      <div className="card overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-400">Loading categories...</div>
        ) : categories.length === 0 ? (
          <div className="p-12 text-center space-y-2">
            <Tag size={36} className="mx-auto text-slate-300" />
            <h3 className="font-bold text-sm text-slate-800">No Categories Found</h3>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Category</th>
                  <th>Slug</th>
                  <th>Subcategories</th>
                  <th>Products</th>
                  <th>Sort</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {categories.map((cat) => (
                  <tr key={cat.id}>
                    <td>
                      <div className="flex items-center gap-3">
                        <img
                          src={cat.image || 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=150&q=80'}
                          alt={cat.name}
                          className="w-10 h-10 rounded-xl object-cover border border-slate-100 shrink-0"
                        />
                        <span className="font-bold text-slate-900 text-sm">{cat.name}</span>
                      </div>
                    </td>
                    <td className="text-xs text-slate-500 font-mono">{cat.slug}</td>
                    <td className="text-xs text-slate-600">
                      {cat.subcategories?.length || 0} subcategories
                    </td>
                    <td className="font-bold text-emerald-700 text-xs">
                      {cat._count?.products || 0} products
                    </td>
                    <td className="text-xs text-slate-500">{cat.sortOrder}</td>
                    <td>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleOpenModal(cat)}
                          className="btn btn-ghost btn-sm p-1 text-slate-500 hover:text-emerald-700"
                        >
                          <Edit size={14} />
                        </button>
                        <button
                          onClick={() => handleDelete(cat.id)}
                          className="btn btn-ghost btn-sm p-1 text-slate-400 hover:text-rose-600"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 md:p-8 max-w-md w-full space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="font-extrabold text-base text-slate-900">
                {editingCat ? 'Edit Category' : 'Add New Category'}
              </h3>
              <button onClick={() => setModalOpen(false)} className="p-1 text-slate-400 font-bold">
                ✕
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="form-label text-xs font-bold uppercase text-slate-700">Category Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Pure Honey (মধু)"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value)
                    if (!editingCat) setSlug(slugify(e.target.value))
                  }}
                  className="input text-xs rounded-xl"
                />
              </div>

              <div>
                <label className="form-label text-xs font-bold uppercase text-slate-700">Slug *</label>
                <input
                  type="text"
                  required
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  className="input text-xs rounded-xl font-mono"
                />
              </div>

              <div>
                <label className="form-label text-xs font-bold uppercase text-slate-700">Image URL</label>
                <input
                  type="url"
                  placeholder="https://..."
                  value={image}
                  onChange={(e) => setImage(e.target.value)}
                  className="input text-xs rounded-xl"
                />
              </div>

              <div>
                <label className="form-label text-xs font-bold uppercase text-slate-700">Description</label>
                <input
                  type="text"
                  placeholder="Brief category summary"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="input text-xs rounded-xl"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  disabled={submitting}
                  className="btn btn-primary flex-1 rounded-xl text-xs font-bold"
                >
                  {submitting ? 'Saving...' : 'Save Category'}
                </button>
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="btn btn-ghost rounded-xl text-xs font-semibold"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
