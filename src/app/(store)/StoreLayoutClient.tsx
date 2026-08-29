'use client'
import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import {
  Search, ShoppingCart, Heart, User, Menu, X, ChevronDown,
  Phone, Mail, Leaf, Home, Package,
  Tag, Gift, Zap, Star, TrendingUp, MessageCircle
} from 'lucide-react'
import toast from 'react-hot-toast'

interface StoreLayoutClientProps {
  children: React.ReactNode
  branding: {
    siteName: string
    tagline: string
    logoUrl: string
    phone: string
    email: string
    whatsapp: string
    facebook: string
    instagram: string
    announcementText: string
    announcementActive: boolean
    currencySymbol: string
    footerBg: string
    footerAbout?: string
  }
  categories: any[]
}

export default function StoreLayoutClient({ children, branding, categories }: StoreLayoutClientProps) {
  const router = useRouter()
  const pathname = usePathname()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [cartCount, setCartCount] = useState(0)
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [searching, setSearching] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const [megaMenu, setMegaMenu] = useState<string | null>(null)
  const searchRef = useRef<HTMLDivElement>(null)
  const searchTimer = useRef<any>(null)

  useEffect(() => {
    fetchCartCount()
    fetchUser()
  }, [pathname])

  const fetchCartCount = async () => {
    try {
      const res = await fetch('/api/cart')
      const data = await res.json()
      if (data.success) setCartCount(data.data.items?.length || 0)
    } catch {}
  }

  const fetchUser = async () => {
    try {
      const res = await fetch('/api/auth/me')
      if (res.ok) { const d = await res.json(); setUser(d.user) }
      else setUser(null)
    } catch { setUser(null) }
  }

  const handleSearch = (q: string) => {
    setSearchQuery(q)
    if (searchTimer.current) clearTimeout(searchTimer.current)
    if (!q.trim() || q.length < 2) { setSearchResults([]); return }
    searchTimer.current = setTimeout(async () => {
      setSearching(true)
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`)
        const data = await res.json()
        if (data.success) setSearchResults(data.data)
      } catch {} finally { setSearching(false) }
    }, 300)
  }

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`)
      setSearchOpen(false)
      setSearchResults([])
    }
  }

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    setUser(null)
    toast.success('Logged out')
    router.push('/')
  }

  const addToCart = async (productId: string, e: React.MouseEvent) => {
    e.preventDefault()
    try {
      const res = await fetch('/api/cart', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ productId, quantity: 1 }) })
      if (res.ok) { toast.success('Added to cart'); fetchCartCount() }
      else { const d = await res.json(); toast.error(d.error || 'Failed') }
    } catch { toast.error('Error adding to cart') }
  }

  const navLinks = [
    { label: 'Home', href: '/', icon: Home },
    { label: 'Shop', href: '/shop', icon: Package },
    { label: 'Categories', href: '/categories', icon: Tag, hasMega: true },
    { label: 'Flash Sale', href: '/flash-sale', icon: Zap, highlight: true },
    { label: 'Combos', href: '/combos', icon: Gift },
    { label: 'Offers', href: '/offers', icon: Star },
    { label: 'New Arrivals', href: '/shop?newArrival=true', icon: TrendingUp },
  ]

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Announcement Bar */}
      {branding.announcementActive && branding.announcementText && (
        <div className="announcement-bar" style={{ background: 'linear-gradient(90deg, #15803d, #166534)', color: '#fff', padding: '0.35rem 0', fontSize: '0.75rem', textAlign: 'center', fontWeight: 600 }}>
          <div className="container">
            <span>{branding.announcementText}</span>
          </div>
        </div>
      )}

      {/* Header (Non-sticky on computer/desktop, compact luxury) */}
      <header className="store-header" style={{ background: '#fff', borderBottom: '1px solid #e2e8f0', position: 'relative', zIndex: 100 }}>
        {/* Top Row */}
        <div className="container" style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', padding: '0.5rem 0.85rem' }}>
          {/* Hamburger - Mobile */}
          <button
            onClick={() => setMobileMenuOpen(true)}
            style={{ display: 'none', background: 'none', border: 'none', cursor: 'pointer', color: '#475569', padding: '0.2rem' }}
            className="mobile-menu-btn"
          >
            <Menu size={20} />
          </button>

          {/* Logo */}
          <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.4rem', flexShrink: 0 }}>
            {branding.logoUrl ? (
              <img src={branding.logoUrl} alt={branding.siteName} style={{ height: '2rem', width: 'auto' }} />
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <div style={{ width: '1.9rem', height: '1.9rem', background: 'linear-gradient(135deg, #16a34a, #15803d)', borderRadius: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Leaf size={15} color="#fff" />
                </div>
                <div>
                  <div style={{ fontWeight: 800, fontSize: '1rem', color: '#15803d', letterSpacing: '-0.02em', lineHeight: 1 }}>
                    ShuddhoBazar
                  </div>
                  <div style={{ fontSize: '0.55rem', color: '#64748b', letterSpacing: '0.04em', lineHeight: 1 }}>
                    PURE & ORGANIC
                  </div>
                </div>
              </div>
            )}
          </Link>

          {/* Search Bar - Desktop */}
          <div style={{ flex: 1, maxWidth: '520px', position: 'relative' }} ref={searchRef}>
            <form onSubmit={handleSearchSubmit}>
              <div style={{ position: 'relative' }}>
                <Search size={14} style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                <input
                  value={searchQuery}
                  onChange={e => handleSearch(e.target.value)}
                  onFocus={() => setSearchOpen(true)}
                  onBlur={() => setTimeout(() => setSearchOpen(false), 200)}
                  placeholder="Search honey, pure ghee, spices, wood-pressed oils..."
                  style={{ width: '100%', padding: '0.45rem 0.85rem 0.45rem 2.4rem', border: '1.5px solid #e2e8f0', borderRadius: '0.65rem', fontSize: '0.8rem', outline: 'none', background: '#f8fafc', transition: 'border-color 0.15s' }}
                />
                {searchQuery && (
                  <button type="button" onClick={() => { setSearchQuery(''); setSearchResults([]) }} style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}>
                    <X size={13} />
                  </button>
                )}
              </div>
            </form>
            {/* Search Results Dropdown */}
            {searchOpen && (searchResults.length > 0 || searching) && (
              <div className="dropdown" style={{ width: '100%', maxHeight: '350px', overflowY: 'auto' }}>
                {searching ? (
                  <div style={{ padding: '1rem', textAlign: 'center', color: '#94a3b8', fontSize: '0.875rem' }}>Searching...</div>
                ) : searchResults.map((p) => (
                  <Link
                    key={p.id}
                    href={`/product/${p.slug}`}
                    style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem 1rem', textDecoration: 'none', color: '#1e293b', transition: 'background 0.1s' }}
                    onMouseOver={e => (e.currentTarget.style.background = '#f8fafc')}
                    onMouseOut={e => (e.currentTarget.style.background = '')}
                  >
                    <div style={{ width: '2.5rem', height: '2.5rem', background: '#f1f5f9', borderRadius: '0.5rem', overflow: 'hidden', flexShrink: 0 }}>
                      {p.thumbnail && <img src={p.thumbnail} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 500, fontSize: '0.875rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.name}</div>
                      <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{p.category?.name} {p.brand?.name && `· ${p.brand.name}`}</div>
                    </div>
                    <div style={{ fontWeight: 700, color: '#16a34a', fontSize: '0.875rem', flexShrink: 0 }}>
                      {branding.currencySymbol}{(p.salePrice || p.regularPrice).toLocaleString()}
                    </div>
                  </Link>
                ))}
                {searchResults.length > 0 && (
                  <Link href={`/search?q=${searchQuery}`} style={{ display: 'block', padding: '0.75rem 1rem', textAlign: 'center', fontSize: '0.8rem', color: '#16a34a', fontWeight: 600, borderTop: '1px solid #f1f5f9', textDecoration: 'none', background: '#f0fdf4' }}>
                    View all results for "{searchQuery}"
                  </Link>
                )}
              </div>
            )}
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginLeft: 'auto' }}>
            {/* Phone */}
            {branding.phone && (
              <a href={`tel:${branding.phone}`} style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', textDecoration: 'none', color: '#475569', fontSize: '0.825rem', fontWeight: 500, padding: '0.4rem 0.6rem', borderRadius: '0.4rem' }}
                className="desktop-only">
                <Phone size={15} color="#16a34a" />
                <span style={{ color: '#0f172a' }}>{branding.phone}</span>
              </a>
            )}

            {/* Wishlist */}
            <Link href="/wishlist" style={{ position: 'relative', padding: '0.5rem', color: '#475569', textDecoration: 'none', display: 'flex', alignItems: 'center', borderRadius: '0.5rem' }}>
              <Heart size={20} />
            </Link>

            {/* Cart */}
            <Link href="/cart" style={{ position: 'relative', padding: '0.5rem', color: '#475569', textDecoration: 'none', display: 'flex', alignItems: 'center', borderRadius: '0.5rem' }}>
              <ShoppingCart size={20} />
              {cartCount > 0 && (
                <span style={{ position: 'absolute', top: '2px', right: '2px', background: '#16a34a', color: '#fff', borderRadius: '50%', width: '16px', height: '16px', fontSize: '0.65rem', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>
                  {cartCount > 9 ? '9+' : cartCount}
                </span>
              )}
            </Link>

            {/* Account */}
            <div style={{ position: 'relative' }}>
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                onBlur={() => setTimeout(() => setUserMenuOpen(false), 200)}
                style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.5rem 0.7rem', border: '1.5px solid #e2e8f0', borderRadius: '0.5rem', background: 'none', cursor: 'pointer', color: '#475569', fontSize: '0.825rem' }}
              >
                <User size={16} />
                <span className="desktop-only">{user ? user.name?.split(' ')[0] : 'Account'}</span>
              </button>
              {userMenuOpen && (
                <div className="dropdown" style={{ right: 0, left: 'auto', minWidth: '180px' }}>
                  {user ? (
                    <>
                      <div style={{ padding: '0.75rem 1rem', borderBottom: '1px solid #f1f5f9' }}>
                        <div style={{ fontWeight: 600, fontSize: '0.875rem', color: '#0f172a' }}>{user.name}</div>
                        <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{user.email || user.phone}</div>
                      </div>
                      <Link href="/account" style={{ display: 'block', padding: '0.6rem 1rem', textDecoration: 'none', color: '#475569', fontSize: '0.875rem' }}>My Account</Link>
                      <Link href="/orders" style={{ display: 'block', padding: '0.6rem 1rem', textDecoration: 'none', color: '#475569', fontSize: '0.875rem' }}>My Orders</Link>
                      <Link href="/wishlist" style={{ display: 'block', padding: '0.6rem 1rem', textDecoration: 'none', color: '#475569', fontSize: '0.875rem' }}>Wishlist</Link>
                      {user.role !== 'CUSTOMER' && (
                        <Link href="/admin" style={{ display: 'block', padding: '0.6rem 1rem', textDecoration: 'none', color: '#16a34a', fontSize: '0.875rem', fontWeight: 600 }}>Admin Panel</Link>
                      )}
                      <div style={{ borderTop: '1px solid #f1f5f9' }}>
                        <button onClick={handleLogout} style={{ width: '100%', padding: '0.6rem 1rem', background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444', fontSize: '0.875rem', textAlign: 'left' }}>Logout</button>
                      </div>
                    </>
                  ) : (
                    <>
                      <Link href="/login" style={{ display: 'block', padding: '0.75rem 1rem', textDecoration: 'none', color: '#0f172a', fontWeight: 600, fontSize: '0.875rem' }}>Sign In</Link>
                      <Link href="/register" style={{ display: 'block', padding: '0.75rem 1rem', textDecoration: 'none', color: '#16a34a', fontSize: '0.875rem', borderTop: '1px solid #f1f5f9' }}>Create Account</Link>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Nav Row */}
        <div style={{ borderTop: '1px solid #f1f5f9', background: '#fafafa' }}>
          <div className="container" style={{ display: 'flex', alignItems: 'center', gap: '0.15rem', padding: '0 0.85rem' }}>
            {navLinks.map((link) => (
              <div key={link.href} style={{ position: 'relative' }}
                onMouseEnter={() => link.hasMega ? setMegaMenu('categories') : null}
                onMouseLeave={() => setMegaMenu(null)}
              >
                <Link
                  href={link.href}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '0.25rem',
                    padding: '0.45rem 0.65rem',
                    textDecoration: 'none',
                    fontSize: '0.78rem',
                    fontWeight: 600,
                    color: link.highlight ? '#f97316' : pathname === link.href || (link.href !== '/' && pathname.startsWith(link.href.split('?')[0])) ? '#16a34a' : '#374151',
                    borderBottom: '2px solid',
                    borderBottomColor: pathname === link.href || (link.href !== '/' && pathname.startsWith(link.href.split('?')[0])) ? '#16a34a' : 'transparent',
                    transition: 'all 0.15s',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {link.icon && <link.icon size={13} />}
                  {link.label}
                  {link.hasMega && <ChevronDown size={11} />}
                </Link>

                {/* Mega Menu */}
                {link.hasMega && megaMenu === 'categories' && categories.length > 0 && (
                  <div style={{
                    position: 'absolute', top: '100%', left: 0, background: '#fff',
                    boxShadow: '0 20px 40px rgba(0,0,0,0.12)', borderRadius: '0.85rem',
                    padding: '1rem', zIndex: 200, minWidth: '550px',
                    display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.25rem',
                    animation: 'dropdownIn 0.2s ease',
                  }}>
                    {categories.slice(0, 9).map((cat) => (
                      <div key={cat.id}>
                        <Link href={`/shop?category=${cat.slug}`} style={{ fontWeight: 600, fontSize: '0.8rem', color: '#0f172a', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.35rem', marginBottom: '0.35rem' }}>
                          {cat.image && <img src={cat.image} alt={cat.name} style={{ width: '1.1rem', height: '1.1rem', borderRadius: '0.25rem', objectFit: 'cover' }} />}
                          {cat.name}
                        </Link>
                        {cat.subcategories?.slice(0, 4).map((sub: any) => (
                          <Link key={sub.id} href={`/shop?subcategory=${sub.slug}`} style={{ display: 'block', fontSize: '0.75rem', color: '#64748b', textDecoration: 'none', padding: '0.1rem 0', transition: 'color 0.1s' }}
                            onMouseOver={e => (e.currentTarget.style.color = '#16a34a')}
                            onMouseOut={e => (e.currentTarget.style.color = '#64748b')}>
                            {sub.name}
                          </Link>
                        ))}
                      </div>
                    ))}
                    <div style={{ gridColumn: '1/-1', borderTop: '1px solid #f1f5f9', paddingTop: '0.5rem' }}>
                      <Link href="/categories" style={{ color: '#16a34a', fontSize: '0.75rem', fontWeight: 600, textDecoration: 'none' }}>
                        View all categories →
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </header>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <>
          <div onClick={() => setMobileMenuOpen(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 150 }} />
          <div style={{ position: 'fixed', top: 0, left: 0, height: '100%', width: 'min(320px, 90vw)', background: '#fff', zIndex: 151, overflowY: 'auto', display: 'flex', flexDirection: 'column', animation: 'slideInRight 0.25s ease' }}>
            {/* Mobile Menu Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 1.25rem', borderBottom: '1px solid #f1f5f9' }}>
              <span style={{ fontWeight: 700, color: '#0f172a' }}>Menu</span>
              <button onClick={() => setMobileMenuOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#475569' }}><X size={20} /></button>
            </div>
            {/* Mobile Nav Links */}
            <nav style={{ flex: 1, padding: '0.75rem 0' }}>
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem 1.25rem', textDecoration: 'none', color: '#374151', fontSize: '0.9rem', fontWeight: 500, borderBottom: '1px solid #f8fafc' }}
                >
                  <link.icon size={16} color="#16a34a" /> {link.label}
                </Link>
              ))}
              <div style={{ padding: '0.75rem 1.25rem', borderTop: '1px solid #f1f5f9', marginTop: '0.5rem' }}>
                {user ? (
                  <div>
                    <div style={{ fontWeight: 600, marginBottom: '0.5rem', color: '#0f172a' }}>Hello, {user.name}</div>
                    <Link href="/account" onClick={() => setMobileMenuOpen(false)} style={{ display: 'block', padding: '0.5rem 0', textDecoration: 'none', color: '#475569', fontSize: '0.875rem' }}>My Account</Link>
                    <Link href="/orders" onClick={() => setMobileMenuOpen(false)} style={{ display: 'block', padding: '0.5rem 0', textDecoration: 'none', color: '#475569', fontSize: '0.875rem' }}>My Orders</Link>
                    <button onClick={handleLogout} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444', fontSize: '0.875rem', padding: '0.5rem 0', display: 'block' }}>Logout</button>
                  </div>
                ) : (
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <Link href="/login" className="btn btn-outline" style={{ flex: 1 }}>Sign In</Link>
                    <Link href="/register" className="btn btn-primary" style={{ flex: 1 }}>Register</Link>
                  </div>
                )}
              </div>
            </nav>
          </div>
        </>
      )}

      {/* Main Content */}
      <main style={{ flex: 1 }} className="page-enter">
        {children}
      </main>

      {/* Footer (Compact luxury style) */}
      <footer style={{ background: branding.footerBg || '#0f2115', color: '#94a3b8', paddingTop: '1.75rem', borderTop: '1px solid rgba(22, 163, 74, 0.2)' }}>
        <div className="container" style={{ padding: '0 0.85rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1.5rem', paddingBottom: '1.5rem' }}>
            {/* Brand */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.6rem' }}>
                <div style={{ width: '1.6rem', height: '1.6rem', background: '#16a34a', borderRadius: '0.4rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Leaf size={12} color="#fff" />
                </div>
                <span style={{ color: '#fff', fontWeight: 800, fontSize: '0.95rem' }}>ShuddhoBazar</span>
              </div>
              <p style={{ fontSize: '0.78rem', lineHeight: 1.6, color: '#64748b', margin: 0 }}>
                {branding.footerAbout || 'Premium pure and organic grocery from Bangladesh. Farm to table with trust.'}
              </p>
              <div style={{ display: 'flex', gap: '0.4rem', marginTop: '0.75rem' }}>
                {branding.facebook && (
                  <a href={branding.facebook} target="_blank" rel="noopener noreferrer" style={{ width: '1.75rem', height: '1.75rem', background: '#162e1c', border: '1px solid #2d4533', borderRadius: '0.4rem', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8', textDecoration: 'none', transition: 'all 0.15s' }}>
                    <svg width="12" height="12" fill="currentColor" viewBox="0 0 24 24"><path d="M9 8H6v4h3v12h5V12h3.642L18 8h-4V6.333C14 5.374 14.5 5 15.7 5H18V0h-3.808C10.595 0 9 1.583 9 4.615V8z"/></svg>
                  </a>
                )}
                {branding.instagram && (
                  <a href={branding.instagram} target="_blank" rel="noopener noreferrer" style={{ width: '1.75rem', height: '1.75rem', background: '#162e1c', border: '1px solid #2d4533', borderRadius: '0.4rem', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8', textDecoration: 'none', transition: 'all 0.15s' }}>
                    <svg width="12" height="12" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
                  </a>
                )}
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h4 style={{ color: '#e2e8f0', fontWeight: 700, fontSize: '0.8rem', marginBottom: '0.6rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Shop</h4>
              {[
                { label: 'All Products', href: '/shop' },
                { label: 'Flash Deals', href: '/flash-sale' },
                { label: 'Combos & Packs', href: '/combos' },
                { label: 'Track Order', href: '/track-order' },
              ].map(link => (
                <Link key={link.href} href={link.href} style={{ display: 'block', color: '#94a3b8', textDecoration: 'none', fontSize: '0.78rem', padding: '0.18rem 0', transition: 'color 0.1s' }}
                  onMouseOver={e => (e.currentTarget.style.color = '#4ade80')}
                  onMouseOut={e => (e.currentTarget.style.color = '#94a3b8')}>
                  {link.label}
                </Link>
              ))}
            </div>

            {/* Help & Policies */}
            <div>
              <h4 style={{ color: '#e2e8f0', fontWeight: 700, fontSize: '0.8rem', marginBottom: '0.6rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Help & Info</h4>
              {[
                { label: 'About ShuddhoBazar', href: '/pages/about-us' },
                { label: 'Contact Us', href: '/pages/contact-us' },
                { label: 'FAQ', href: '/pages/faq' },
                { label: 'Return Policy', href: '/pages/return-policy' },
                { label: 'Privacy & Terms', href: '/pages/privacy-policy' },
              ].map(link => (
                <Link key={link.href} href={link.href} style={{ display: 'block', color: '#94a3b8', textDecoration: 'none', fontSize: '0.78rem', padding: '0.18rem 0', transition: 'color 0.1s' }}
                  onMouseOver={e => (e.currentTarget.style.color = '#4ade80')}
                  onMouseOut={e => (e.currentTarget.style.color = '#94a3b8')}>
                  {link.label}
                </Link>
              ))}
            </div>

            {/* Contact & Support */}
            <div>
              <h4 style={{ color: '#e2e8f0', fontWeight: 700, fontSize: '0.8rem', marginBottom: '0.6rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Customer Care</h4>
              {branding.phone && (
                <a href={`tel:${branding.phone}`} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#cbd5e1', textDecoration: 'none', fontSize: '0.78rem', marginBottom: '0.4rem' }}>
                  <Phone size={12} color="#4ade80" /> {branding.phone}
                </a>
              )}
              {branding.email && (
                <a href={`mailto:${branding.email}`} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#cbd5e1', textDecoration: 'none', fontSize: '0.78rem', marginBottom: '0.4rem' }}>
                  <Mail size={12} color="#4ade80" /> {branding.email}
                </a>
              )}
              <div style={{ marginTop: '0.6rem' }}>
                <div style={{ fontSize: '0.72rem', color: '#64748b', marginBottom: '0.3rem' }}>Supported Payments:</div>
                <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap' }}>
                  {['Cash On Delivery', 'bKash', 'Nagad', 'Rocket'].map(m => (
                    <span key={m} style={{ padding: '0.15rem 0.4rem', background: '#162e1c', border: '1px solid #2d4533', borderRadius: '0.25rem', fontSize: '0.65rem', color: '#cbd5e1' }}>{m}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Bottom bar */}
          <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', padding: '0.85rem 0', display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '0.5rem' }}>
            <p style={{ margin: 0, fontSize: '0.75rem', color: '#64748b' }}>
              © {new Date().getFullYear()} ShuddhoBazar. All rights reserved.
            </p>
            <p style={{ margin: 0, fontSize: '0.75rem', color: '#64748b' }}>
              Made in Bangladesh 🇧🇩 with ❤️
            </p>
          </div>
        </div>
      </footer>

      {/* WhatsApp Float */}
      {branding.whatsapp && (
        <a
          href={`https://wa.me/${branding.whatsapp.replace(/\D/g, '')}?text=Hello, I have a query about my order.`}
          target="_blank"
          rel="noopener noreferrer"
          className="whatsapp-float"
          title="Chat on WhatsApp"
        >
          <MessageCircle size={24} />
        </a>
      )}

      {/* Mobile Bottom Nav (Strictly mobile only, hidden on computer) */}
      <nav className="mobile-bottom-nav">
        {[
          { label: 'Home', href: '/', icon: Home },
          { label: 'Shop', href: '/shop', icon: Package },
          { label: 'Cart', href: '/cart', icon: ShoppingCart, badge: cartCount },
          { label: 'Wishlist', href: '/wishlist', icon: Heart },
          { label: 'Account', href: user ? '/account' : '/login', icon: User },
        ].map(item => (
          <Link
            key={item.href}
            href={item.href}
            style={{
              flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
              textDecoration: 'none', color: pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href)) ? '#16a34a' : '#94a3b8',
              fontSize: '0.65rem', gap: '0.2rem', fontWeight: 500, position: 'relative',
            }}
          >
            <div style={{ position: 'relative' }}>
              <item.icon size={20} />
              {item.badge && item.badge > 0 && (
                <span style={{ position: 'absolute', top: '-4px', right: '-6px', background: '#16a34a', color: '#fff', borderRadius: '50%', width: '14px', height: '14px', fontSize: '0.55rem', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>
                  {item.badge > 9 ? '9+' : item.badge}
                </span>
              )}
            </div>
            {item.label}
          </Link>
        ))}
      </nav>

      <style>{`
        .desktop-only { display: flex; }
        .mobile-menu-btn { display: none; }
        .mobile-bottom-nav { display: none; }
        @media (max-width: 767px) {
          .desktop-only { display: none !important; }
          .mobile-menu-btn { display: flex !important; }
          .mobile-bottom-nav { display: flex !important; }
          nav + div > div:nth-child(2) { display: none; }
        }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  )
}
