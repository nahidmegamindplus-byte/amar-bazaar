'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Leaf, Lock, Mail, Phone, Eye, EyeOff, ArrowRight } from 'lucide-react'
import toast from 'react-hot-toast'

export default function CustomerLoginPage() {
  const router = useRouter()
  const [identifier, setIdentifier] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const isEmail = identifier.includes('@')
      const payload = {
        email: isEmail ? identifier : undefined,
        phone: !isEmail ? identifier : undefined,
        password,
      }

      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      const data = await res.json()
      if (res.ok && data.success) {
        toast.success(`Welcome back, ${data.user.name || 'Customer'}!`)
        if (data.user.role !== 'CUSTOMER') {
          router.push('/admin')
        } else {
          router.push('/account')
        }
        router.refresh()
      } else {
        toast.error(data.error || 'Invalid credentials')
      }
    } catch {
      toast.error('Network error during login')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container py-12 flex items-center justify-center min-h-[70vh]">
      <div className="w-full max-w-md bg-white rounded-3xl border border-slate-100 p-6 md:p-8 shadow-md space-y-6">
        <div className="text-center space-y-1">
          <div className="w-12 h-12 bg-emerald-600 rounded-2xl flex items-center justify-center mx-auto text-white mb-2 shadow-md">
            <Leaf size={24} />
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900">Sign In to ShuddhoBazar</h1>
          <p className="text-xs text-slate-500">Access your orders, profile, and saved organic items</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="form-label text-xs font-bold uppercase text-slate-700">Email or Mobile Number *</label>
            <input
              type="text"
              required
              placeholder="e.g. 017XXXXXXXX or user@gmail.com"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              className="input rounded-xl text-sm"
              autoFocus
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="form-label text-xs font-bold uppercase text-slate-700 mb-0">Password *</label>
            </div>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input rounded-xl text-sm pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary btn-lg w-full rounded-2xl font-extrabold text-sm flex items-center justify-center gap-2 shadow-md shadow-emerald-700/20"
          >
            <span>{loading ? 'Signing In...' : 'Sign In (লগইন করুন)'}</span>
            <ArrowRight size={16} />
          </button>
        </form>

        <div className="text-center pt-2 border-t border-slate-100 text-xs text-slate-500">
          Don’t have an account yet?{' '}
          <Link href="/register" className="font-bold text-emerald-600 hover:underline">
            Register Now
          </Link>
        </div>
      </div>
    </div>
  )
}
