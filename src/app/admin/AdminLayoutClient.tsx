'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  LayoutDashboard, ShoppingBag, Package, Tag, Award, Archive,
  Users, Star, Ticket, Zap, Gift, ImageIcon, Home, FileText,
  Menu, Library, Truck, CreditCard, BarChart2, Bell, Settings,
  Activity, ChevronDown, ChevronRight, X, LogOut, Search,
  MessageCircle, ShieldCheck, BookOpen, Layers, AlertTriangle, PhoneCall
} from 'lucide-react'

interface NavChildItem {
  label: string
  href: string
  icon: any
  badge?: string
}


interface NavItem {
  label: string
  href?: string
  icon: any
  badge?: string
  children?: NavChildItem[]
}

const navItems: NavItem[] = [
  { label: 'Dashboard', href: '/admin', icon: LayoutDashboard },
  {
    label: 'Orders', icon: ShoppingBag, children: [
      { label: 'All Orders', href: '/admin/orders', icon: ShoppingBag, badge: 'orders' },
      { label: 'Incomplete Orders', href: '/admin/orders/incomplete', icon: AlertTriangle, badge: 'incomplete' },
    ]
  },
  {
    label: 'Catalog', icon: Package, children: [
      { label: 'All Products', href: '/admin/products', icon: Package },
      { label: 'Add Product', href: '/admin/products/new', icon: Package },
      { label: 'Categories', href: '/admin/categories', icon: Tag },
      { label: 'Brands', href: '/admin/brands', icon: Award },
      { label: 'Inventory', href: '/admin/inventory', icon: Archive },
    ]
  },
  {
    label: 'Marketing', icon: Ticket, children: [
      { label: 'Coupons', href: '/admin/coupons', icon: Ticket },
      { label: 'Flash Sale', href: '/admin/flash-sale', icon: Zap },
      { label: 'Combo Deals', href: '/admin/combos', icon: Gift },
    ]
  },
  { label: 'Customers', href: '/admin/customers', icon: Users },
  { label: 'Reviews', href: '/admin/reviews', icon: Star },
  {
    label: 'Content', icon: FileText, children: [
      { label: 'Homepage', href: '/admin/homepage', icon: Home },
      { label: 'Banners', href: '/admin/banners', icon: ImageIcon },
      { label: 'Pages', href: '/admin/pages', icon: FileText },
      { label: 'Media Library', href: '/admin/media', icon: Library },
    ]
  },
  {
    label: 'Store', icon: Settings, children: [
      { label: 'Delivery', href: '/admin/delivery', icon: Truck },
      { label: 'Settings', href: '/admin/settings', icon: Settings },
    ]
  },
  { label: 'Analytics', href: '/admin/analytics', icon: BarChart2 },
  { label: 'Staff & Roles', href: '/admin/users', icon: ShieldCheck },
]


interface AdminLayoutClientProps {
  children: React.ReactNode
  adminName: string
  adminEmail: string
  isAuthenticated: boolean
}

export default function AdminLayoutClient({
  children,
  adminName,
  adminEmail,
  isAuthenticated
}: AdminLayoutClientProps) {
  const pathname = usePathname()
  const router = useRouter()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({})
  const [searchQuery, setSearchQuery] = useState('')
  const [pendingCount, setPendingCount] = useState(0)
  const [incompleteCount, setIncompleteCount] = useState(0)

  useEffect(() => {
    if (!isAuthenticated && pathname !== '/admin/login') {
      router.push('/admin/login')
    }
  }, [isAuthenticated, pathname, router])

  useEffect(() => {
    if (isAuthenticated) {
      fetch('/api/analytics')
        .then(r => r.json())
        .then(d => {
          if (d.success) setPendingCount(d.data.cards?.pendingOrders || 0)
        })
        .catch(() => {})

      fetch('/api/admin/incomplete-orders?limit=1')
        .then(r => r.json())
        .then(d => {
          if (d.success && d.stats) {
            setIncompleteCount(d.stats.notContactedCount || 0)
          }
        })
        .catch(() => {})
    }
  }, [isAuthenticated])


  const toggleCollapse = (label: string) => {
    setCollapsed(prev => ({ ...prev, [label]: !prev[label] }))
  }

  const isActive = (href: string) => {
    if (href === '/admin') return pathname === '/admin'
    return pathname.startsWith(href)
  }

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/admin/login')
    router.refresh()
  }

  // If on login page, render child without dashboard chrome
  if (pathname === '/admin/login') {
    return <>{children}</>
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f8fafc' }}>
      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 99 }}
        />
      )}

      {/* Sidebar */}
      <aside className={`admin-sidebar${sidebarOpen ? ' open' : ''}`}>
        {/* Logo */}
        <div style={{ padding: '1.25rem 1.25rem 0.75rem', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
          <Link href="/admin" style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', textDecoration: 'none' }}>
            <div style={{ width: '2.2rem', height: '2.2rem', background: 'linear-gradient(135deg, #16a34a, #15803d)', borderRadius: '0.6rem', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(22,163,74,0.3)' }}>
              <span style={{ color: '#fff', fontWeight: 800, fontSize: '1rem' }}>S</span>
            </div>
            <div>
              <div style={{ color: '#f1f5f9', fontWeight: 800, fontSize: '1rem', lineHeight: 1.1 }}>ShuddhoBazar</div>
              <div style={{ color: '#64748b', fontSize: '0.7rem', fontWeight: 500 }}>Super Admin Panel</div>
            </div>
          </Link>
          <button onClick={() => setSidebarOpen(false)} style={{ display: 'none', position: 'absolute', top: '1rem', right: '1rem', background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }} className="lg-hide">
            <X size={20} />
          </button>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, overflowY: 'auto', padding: '0.75rem 0', scrollbarWidth: 'thin' }}>
          {navItems.map((item) => {
            if (item.children) {
              const isExpanded = collapsed[item.label] !== false && item.children.some(c => isActive(c.href || ''))
              const expanded = collapsed[item.label] === undefined ? isExpanded : !collapsed[item.label]
              return (
                <div key={item.label}>
                  <button
                    onClick={() => toggleCollapse(item.label)}
                    style={{
                      width: '100%', display: 'flex', alignItems: 'center', gap: '0.6rem',
                      padding: '0.6rem 1.25rem', background: 'none', border: 'none',
                      color: '#94a3b8', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 500,
                      justifyContent: 'space-between',
                    }}
                  >
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                      <item.icon size={16} />
                      {item.label}
                    </span>
                    {expanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                  </button>
                  {expanded && (
                    <div style={{ paddingLeft: '0.5rem' }}>
                      {item.children.map((child) => (
                        <Link
                          key={child.href}
                          href={child.href || '#'}
                          onClick={() => setSidebarOpen(false)}
                          style={{
                            display: 'flex', alignItems: 'center', gap: '0.6rem',
                            padding: '0.5rem 1.25rem', textDecoration: 'none', fontSize: '0.825rem',
                            borderRadius: '0.4rem', margin: '0.1rem 0.5rem',
                            background: isActive(child.href || '') ? 'rgba(22, 163, 74, 0.15)' : 'transparent',
                            color: isActive(child.href || '') ? '#4ade80' : '#94a3b8',
                            fontWeight: isActive(child.href || '') ? 600 : 400,
                          }}
                        >
                          <span style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flex: 1 }}>
                            <child.icon size={14} />
                            {child.label}
                          </span>
                          {child.badge === 'orders' && pendingCount > 0 && (
                            <span style={{ background: '#ef4444', color: '#fff', borderRadius: '100px', padding: '0.05rem 0.4rem', fontSize: '0.65rem', fontWeight: 700 }}>
                              {pendingCount}
                            </span>
                          )}
                          {child.badge === 'incomplete' && incompleteCount > 0 && (
                            <span style={{ background: '#f59e0b', color: '#fff', borderRadius: '100px', padding: '0.05rem 0.4rem', fontSize: '0.65rem', fontWeight: 700 }}>
                              {incompleteCount}
                            </span>
                          )}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              )
            }

            return (
              <Link
                key={item.href}
                href={item.href || '#'}
                onClick={() => setSidebarOpen(false)}
                style={{
                  display: 'flex', alignItems: 'center', gap: '0.6rem', justifyContent: 'space-between',
                  padding: '0.6rem 1.25rem', textDecoration: 'none', fontSize: '0.85rem',
                  borderRadius: '0.4rem', margin: '0.1rem 0.5rem',
                  background: isActive(item.href || '') ? 'rgba(22, 163, 74, 0.15)' : 'transparent',
                  color: isActive(item.href || '') ? '#4ade80' : '#94a3b8',
                  fontWeight: isActive(item.href || '') ? 600 : 400,
                }}
              >
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                  <item.icon size={16} />
                  {item.label}
                </span>
                {item.badge === 'orders' && pendingCount > 0 && (
                  <span style={{ background: '#ef4444', color: '#fff', borderRadius: '100px', padding: '0.1rem 0.45rem', fontSize: '0.7rem', fontWeight: 700 }}>
                    {pendingCount}
                  </span>
                )}
              </Link>
            )
          })}
        </nav>

        {/* User profile */}
        <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', padding: '1rem 1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
            <div style={{ width: '2.2rem', height: '2.2rem', background: 'linear-gradient(135deg, #16a34a, #15803d)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: '0.85rem', flexShrink: 0 }}>
              {adminName.charAt(0).toUpperCase()}
            </div>
            <div style={{ overflow: 'hidden' }}>
              <div style={{ color: '#f1f5f9', fontSize: '0.825rem', fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{adminName}</div>
              <div style={{ color: '#64748b', fontSize: '0.7rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{adminEmail}</div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <Link href="/" target="_blank" style={{ flex: 1, padding: '0.4rem', background: 'rgba(255,255,255,0.06)', border: 'none', borderRadius: '0.4rem', color: '#94a3b8', textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', gap: '0.3rem' }}>
              Storefront
            </Link>
            <button onClick={handleLogout} style={{ flex: 1, padding: '0.4rem', background: 'rgba(239, 68, 68, 0.1)', border: 'none', borderRadius: '0.4rem', color: '#f87171', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', gap: '0.3rem' }}>
              <LogOut size={12} /> Logout
            </button>
          </div>
        </div>
      </aside>

      {/* Main Container */}
      <div className="admin-main" style={{ flex: 1 }}>
        {/* Top bar */}
        <header style={{ background: '#fff', borderBottom: '1px solid #e2e8f0', padding: '0.75rem 1.5rem', display: 'flex', alignItems: 'center', gap: '1rem', position: 'sticky', top: 0, zIndex: 50 }}>
          <button
            onClick={() => setSidebarOpen(true)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#475569', padding: '0.35rem', borderRadius: '0.4rem' }}
          >
            <Menu size={20} />
          </button>

          {/* Search */}
          <div style={{ flex: 1, position: 'relative', maxWidth: '400px' }}>
            <Search size={15} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
            <input
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search orders, products, customers..."
              style={{ width: '100%', padding: '0.5rem 0.75rem 0.5rem 2.2rem', border: '1.5px solid #e2e8f0', borderRadius: '0.5rem', fontSize: '0.85rem', outline: 'none', background: '#f8fafc' }}
            />
          </div>

          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Link href="/admin/orders" style={{ position: 'relative', color: '#475569', textDecoration: 'none' }}>
              <Bell size={18} />
              {pendingCount > 0 && (
                <span style={{ position: 'absolute', top: '-4px', right: '-4px', background: '#ef4444', color: '#fff', borderRadius: '50%', width: '16px', height: '16px', fontSize: '0.65rem', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>
                  {pendingCount > 9 ? '9+' : pendingCount}
                </span>
              )}
            </Link>
            <Link href="/admin/settings" style={{ color: '#475569', textDecoration: 'none' }}>
              <Settings size={18} />
            </Link>
          </div>
        </header>

        {/* Page Content */}
        <main style={{ padding: '1.5rem' }}>
          {children}
        </main>
      </div>
    </div>
  )
}
