'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import { Eye, EyeOff, Leaf, Sparkles, ArrowRight, ShieldCheck } from 'lucide-react'

export default function AdminLoginPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [showPw, setShowPw] = useState(false)
  const [form, setForm] = useState({ email: '', password: '' })

  const executeAdminLogin = async (email: string, pass: string) => {
    setLoading(true)
    const toastId = toast.loading('Signing in to Admin Panel...')
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password: pass }),
      })
      const data = await res.json()
      if (!res.ok || !data.success) {
        toast.error(data.error || 'Login failed', { id: toastId })
        return
      }
      const adminRoles = ['SUPER_ADMIN', 'ADMIN', 'MANAGER', 'ORDER_MANAGER', 'PRODUCT_MANAGER', 'CONTENT_MANAGER', 'DELIVERY_MANAGER', 'SUPPORT_STAFF']
      if (!adminRoles.includes(data.user.role)) {
        toast.error('Access denied. Not an admin account.', { id: toastId })
        return
      }
      toast.success(`Welcome back, ${data.user.name || 'Admin'}! 🎉`, { id: toastId })
      router.push('/admin')
      router.refresh()
    } catch {
      toast.error('Network error during login', { id: toastId })
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    executeAdminLogin(form.email, form.password)
  }

  const handleInstantDemoLogin = () => {
    setForm({ email: 'admin@shuddho.com', password: 'Admin@123456' })
    executeAdminLogin('admin@shuddho.com', 'Admin@123456')
  }

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f2818 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
      <div style={{ width: '100%', maxWidth: '420px' }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ width: '4rem', height: '4rem', background: 'linear-gradient(135deg, #16a34a, #15803d)', borderRadius: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem', boxShadow: '0 10px 25px rgba(22, 163, 74, 0.3)' }}>
            <Leaf size={28} color="#fff" />
          </div>
          <h1 style={{ color: '#f1f5f9', fontSize: '1.5rem', fontWeight: 800, margin: '0 0 0.25rem' }}>ShuddhoBazar</h1>
          <p style={{ color: '#64748b', fontSize: '0.875rem', margin: 0 }}>Admin Panel — Operations Control</p>
        </div>

        {/* Card */}
        <div style={{ background: '#fff', borderRadius: '1.5rem', padding: '2rem', boxShadow: '0 20px 60px rgba(0,0,0,0.3)' }}>
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '1.25rem' }}>
              <label className="form-label text-xs font-bold uppercase text-slate-700">Email Address *</label>
              <input
                type="email"
                className="input text-sm rounded-xl"
                placeholder="admin@shuddho.com"
                value={form.email}
                onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                required
                autoFocus
              />
            </div>
            <div style={{ marginBottom: '1.5rem' }}>
              <label className="form-label text-xs font-bold uppercase text-slate-700">Password *</label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPw ? 'text' : 'password'}
                  className="input text-sm rounded-xl"
                  placeholder="••••••••"
                  value={form.password}
                  onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                  required
                  style={{ paddingRight: '2.75rem' }}
                />
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}
                >
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary btn-xl font-extrabold rounded-xl"
              style={{ width: '100%' }}
            >
              {loading ? 'Signing in...' : 'Sign In to Admin Panel'}
            </button>
          </form>

          {/* 1-Click Instant Demo Login Button */}
          <div style={{ marginTop: '1.5rem', paddingTop: '1.25rem', borderTop: '1px solid #f1f5f9' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: '#64748b', letterSpacing: '0.05em', marginBottom: '0.75rem', textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.35rem' }}>
              <Sparkles size={13} color="#f59e0b" />
              <span>1-Click Instant Demo Login</span>
            </div>
            
            <button
              type="button"
              disabled={loading}
              onClick={handleInstantDemoLogin}
              style={{
                width: '100%',
                padding: '0.75rem 1rem',
                borderRadius: '0.85rem',
                border: '2px solid #16a34a',
                background: '#f0fdf4',
                color: '#15803d',
                fontWeight: 700,
                fontSize: '0.85rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '0.5rem',
                transition: 'all 0.15s',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span>👑</span>
                <span>Super Admin 1-Click Login</span>
              </div>
              <span style={{ fontSize: '0.7rem', background: '#16a34a', color: '#fff', padding: '0.15rem 0.5rem', borderRadius: '0.35rem', fontWeight: 800 }}>
                Instant Access
              </span>
            </button>

            <div style={{ background: '#f8fafc', padding: '0.5rem 0.8rem', borderRadius: '0.5rem', fontSize: '0.75rem', color: '#64748b', textAlign: 'center', border: '1px solid #e2e8f0' }}>
              Email: <strong style={{ color: '#0f172a' }}>admin@shuddho.com</strong> • Pass: <strong style={{ color: '#0f172a' }}>Admin@123456</strong>
            </div>
          </div>
        </div>

        <p style={{ textAlign: 'center', marginTop: '1.5rem', color: '#64748b', fontSize: '0.8rem' }}>
          © {new Date().getFullYear()} ShuddhoBazar. All rights reserved.
        </p>
      </div>
    </div>
  )
}
