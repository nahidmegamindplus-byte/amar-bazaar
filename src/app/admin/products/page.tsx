'use client'
import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import toast from 'react-hot-toast'
import { Plus, Search, Filter, Edit, Trash2, Copy, Eye, Package, Download, Upload, ChevronDown, ToggleLeft, ToggleRight, RefreshCw } from 'lucide-react'
import { formatPrice, formatDate, getStockStatus } from '@/lib/utils'

const STATUS_BADGE: Record<string, { label: string; class: string }> = {
  IN_STOCK: { label: 'In Stock', class: 'badge-green' },
  LOW_STOCK: { label: 'Low Stock', class: 'badge-yellow' },
  OUT_OF_STOCK: { label: 'Out of Stock', class: 'badge-red' },
}

export default function AdminProductsPage() {
  const [products, setProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [pagination, setPagination] = useState<any>(null)
  const [selected, setSelected] = useState<string[]>([])
  const [filter, setFilter] = useState({ status: '', category: '', flag: '' })
  const [showFilter, setShowFilter] = useState(false)

  const fetchProducts = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ page: String(page), limit: '20' })
      if (search) params.set('search', search)
      const res = await fetch(`/api/admin/products?${params}`)
      const data = await res.json()
      if (data.success) {
        setProducts(data.data)
        setPagination(data.pagination)
      }
    } catch {
      toast.error('Failed to load products')
    } finally {
      setLoading(false)
    }
  }, [page, search])

  useEffect(() => { fetchProducts() }, [fetchProducts])

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this product? This cannot be undone.')) return
    try {
      const res = await fetch(`/api/admin/products/${id}`, { method: 'DELETE' })
      if (res.ok) {
        toast.success('Product deleted')
        fetchProducts()
      } else {
        toast.error('Delete failed')
      }
    } catch {
      toast.error('Error deleting product')
    }
  }

  const handleTogglePublish = async (id: string, current: boolean) => {
    try {
      const res = await fetch(`/api/admin/products/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isPublished: !current }),
      })
      if (res.ok) {
        toast.success(current ? 'Product unpublished' : 'Product published')
        fetchProducts()
      }
    } catch {
      toast.error('Update failed')
    }
  }

  const handleBulkAction = async (action: string) => {
    if (selected.length === 0) return toast.error('No products selected')
    if (action === 'delete' && !confirm(`Delete ${selected.length} products?`)) return
    try {
      const res = await fetch('/api/admin/products/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: selected, action }),
      })
      if (res.ok) {
        toast.success('Bulk action applied')
        setSelected([])
        fetchProducts()
      }
    } catch { toast.error('Bulk action failed') }
  }

  const exportCSV = async () => {
    const res = await fetch('/api/admin/products/export')
    const blob = await res.blob()
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `products-${Date.now()}.csv`
    a.click()
  }

  const toggleSelect = (id: string) => {
    setSelected(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])
  }

  const selectAll = () => {
    if (selected.length === products.length) setSelected([])
    else setSelected(products.map(p => p.id))
  }

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 700, color: '#0f172a' }}>Products</h1>
          <p style={{ margin: '0.2rem 0 0', color: '#64748b', fontSize: '0.85rem' }}>
            {pagination ? `${pagination.total} products total` : 'Manage your product catalog'}
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          <button className="btn btn-ghost btn-sm" onClick={exportCSV}><Download size={14} /> Export</button>
          <Link href="/admin/products/new" className="btn btn-primary btn-sm"><Plus size={14} /> Add Product</Link>
        </div>
      </div>

      {/* Toolbar */}
      <div className="card" style={{ padding: '1rem', marginBottom: '1rem' }}>
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
          {/* Search */}
          <div style={{ position: 'relative', flex: '1', minWidth: '200px' }}>
            <Search size={14} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
            <input
              className="input"
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1) }}
              placeholder="Search products, SKU..."
              style={{ paddingLeft: '2.2rem' }}
            />
          </div>

          {/* Bulk actions */}
          {selected.length > 0 && (
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              <span style={{ fontSize: '0.8rem', color: '#475569' }}>{selected.length} selected</span>
              <button className="btn btn-outline btn-sm" onClick={() => handleBulkAction('publish')}>Publish</button>
              <button className="btn btn-outline btn-sm" onClick={() => handleBulkAction('unpublish')}>Unpublish</button>
              <button className="btn btn-danger btn-sm" onClick={() => handleBulkAction('delete')}>Delete</button>
            </div>
          )}

          <button className="btn btn-ghost btn-sm" onClick={fetchProducts}><RefreshCw size={14} /></button>
        </div>
      </div>

      {/* Products Table */}
      <div className="card" style={{ overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: '3rem', textAlign: 'center' }}>
            <RefreshCw size={24} style={{ animation: 'spin 1s linear infinite', color: '#16a34a' }} />
          </div>
        ) : products.length === 0 ? (
          <div className="empty-state">
            <Package size={48} color="#cbd5e1" />
            <h3>No products found</h3>
            <p>{search ? 'Try a different search term.' : 'Add your first product to get started.'}</p>
            <Link href="/admin/products/new" className="btn btn-primary">Add First Product</Link>
          </div>
        ) : (
          <>
            <div style={{ overflowX: 'auto' }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th style={{ width: '40px' }}>
                      <input type="checkbox" checked={selected.length === products.length} onChange={selectAll} />
                    </th>
                    <th>Product</th>
                    <th>SKU</th>
                    <th>Category</th>
                    <th>Price</th>
                    <th>Stock</th>
                    <th>Status</th>
                    <th>Flags</th>
                    <th>Created</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((product) => {
                    const stockStatus = getStockStatus(product.stock, product.lowStockThreshold)
                    return (
                      <tr key={product.id}>
                        <td>
                          <input type="checkbox" checked={selected.includes(product.id)} onChange={() => toggleSelect(product.id)} />
                        </td>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                            <div style={{ width: '2.5rem', height: '2.5rem', background: '#f8fafc', borderRadius: '0.5rem', overflow: 'hidden', flexShrink: 0 }}>
                              {product.thumbnail ? (
                                <img src={product.thumbnail} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                              ) : <Package size={16} color="#cbd5e1" style={{ margin: 'auto', display: 'block', marginTop: '0.6rem' }} />}
                            </div>
                            <div>
                              <div style={{ fontWeight: 600, color: '#0f172a', fontSize: '0.875rem', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{product.name}</div>
                              <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>{product.brand?.name || '—'}</div>
                            </div>
                          </div>
                        </td>
                        <td style={{ fontSize: '0.8rem', color: '#64748b' }}>{product.sku || '—'}</td>
                        <td style={{ fontSize: '0.8rem' }}>{product.category?.name || '—'}</td>
                        <td>
                          <div style={{ fontWeight: 600, color: '#0f172a' }}>{formatPrice(product.salePrice || product.regularPrice)}</div>
                          {product.salePrice && <div style={{ fontSize: '0.72rem', color: '#94a3b8', textDecoration: 'line-through' }}>{formatPrice(product.regularPrice)}</div>}
                        </td>
                        <td>
                          <span className={`badge ${STATUS_BADGE[stockStatus].class}`}>{STATUS_BADGE[stockStatus].label}</span>
                          <div style={{ fontSize: '0.72rem', color: '#94a3b8', marginTop: '0.15rem' }}>{product.stock} units</div>
                        </td>
                        <td>
                          <button
                            onClick={() => handleTogglePublish(product.id, product.isPublished)}
                            style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', background: 'none', border: 'none', cursor: 'pointer', color: product.isPublished ? '#16a34a' : '#94a3b8', fontSize: '0.8rem', fontWeight: 500 }}
                          >
                            {product.isPublished ? <ToggleRight size={18} /> : <ToggleLeft size={18} />}
                            {product.isPublished ? 'Live' : 'Draft'}
                          </button>
                        </td>
                        <td>
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.2rem' }}>
                            {product.isFeatured && <span className="badge badge-blue" style={{ fontSize: '0.65rem' }}>Featured</span>}
                            {product.isOrganic && <span className="badge badge-green" style={{ fontSize: '0.65rem' }}>Organic</span>}
                            {product.isNewArrival && <span className="badge badge-purple" style={{ fontSize: '0.65rem' }}>New</span>}
                            {product.isBestSelling && <span className="badge badge-yellow" style={{ fontSize: '0.65rem' }}>Best</span>}
                            {product.isFlashSale && <span className="badge badge-orange" style={{ fontSize: '0.65rem' }}>Flash</span>}
                          </div>
                        </td>
                        <td style={{ fontSize: '0.8rem', color: '#64748b' }}>{formatDate(product.createdAt)}</td>
                        <td>
                          <div style={{ display: 'flex', gap: '0.25rem' }}>
                            <Link href={`/product/${product.slug}`} target="_blank" className="btn btn-ghost btn-sm" title="View"><Eye size={14} /></Link>
                            <Link href={`/admin/products/${product.id}/edit`} className="btn btn-ghost btn-sm" title="Edit"><Edit size={14} /></Link>
                            <button className="btn btn-ghost btn-sm" title="Duplicate" onClick={async () => {
                              await fetch(`/api/admin/products/${product.id}/duplicate`, { method: 'POST' })
                              toast.success('Product duplicated')
                              fetchProducts()
                            }}><Copy size={14} /></button>
                            <button className="btn btn-ghost btn-sm" title="Delete" onClick={() => handleDelete(product.id)} style={{ color: '#ef4444' }}><Trash2 size={14} /></button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {pagination && pagination.totalPages > 1 && (
              <div style={{ padding: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #f1f5f9' }}>
                <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
                  Page {pagination.page} of {pagination.totalPages} ({pagination.total} products)
                </span>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button className="btn btn-outline btn-sm" disabled={!pagination.hasPrev} onClick={() => setPage(p => p - 1)}>Previous</button>
                  <button className="btn btn-outline btn-sm" disabled={!pagination.hasNext} onClick={() => setPage(p => p + 1)}>Next</button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
