'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Leaf, User, Mail, Phone, Lock, Eye, EyeOff, ArrowRight } from 'lucide-react'
import toast from 'react-hot-toast'

export default function CustomerRegisterPage() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return toast.error('Please enter your full name')
    if (!phone.trim() || phone.length < 11) return toast.error('Please enter an 11-digit mobile number')
    if (password.length < 6) return toast.error('Password must be at least 6 characters')

    setLoading(true)
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          phone,
          email: email || undefined,
          password,
        }),
      })

      const data = await res.json()
      if (res.ok && data.success) {
        toast.success('Registration successful! Welcome to ShuddhoBazar.')
        router.push('/account')
        router.refresh()
      } else {
        toast.error(data.error || 'Registration failed')
      }
    } catch {
      toast.error('Network error during registration')
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
          <h1 className="text-2xl font-extrabold text-slate-900">Create New Account</h1>
          <p className="text-xs text-slate-500">Join our organic community and enjoy pure grocery</p>
        </div>

        <form onSubmit={handleRegister} className="space-y-4">
          <div>
            <label className="form-label text-xs font-bold uppercase text-slate-700">Full Name (সম্পূর্ণ নাম) *</label>
            <input
              type="text"
              required
              placeholder="e.g. Tanvir Ahmed"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="input rounded-xl text-sm"
              autoFocus
            />
          </div>

          <div>
            <label className="form-label text-xs font-bold uppercase text-slate-700">Mobile Number (মোবাইল নম্বর) *</label>
            <input
              type="tel"
              required
              placeholder="017XXXXXXXX"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="input rounded-xl text-sm"
            />
          </div>

          <div>
            <label className="form-label text-xs font-bold uppercase text-slate-700">Email Address (ঐচ্ছিক)</label>
            <input
              type="email"
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input rounded-xl text-sm"
            />
          </div>

          <div>
            <label className="form-label text-xs font-bold uppercase text-slate-700">Password (পাসওয়ার্ড) *</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                placeholder="Min 6 characters"
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
            <span>{loading ? 'Creating Account...' : 'Register (অ্যাকাউন্ট খুলুন)'}</span>
            <ArrowRight size={16} />
          </button>
        </form>

        <div className="text-center pt-2 border-t border-slate-100 text-xs text-slate-500">
          Already have an account?{' '}
          <Link href="/login" className="font-bold text-emerald-600 hover:underline">
            Sign In Here
          </Link>
        </div>
      </div>
    </div>
  )
}
