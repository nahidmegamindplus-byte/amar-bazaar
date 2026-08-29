'use client'
import { useState, useEffect } from 'react'
import { Settings, Save, CheckCircle2, ShieldCheck, CreditCard, Bell, Phone, DollarSign } from 'lucide-react'
import toast from 'react-hot-toast'

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [activeTab, setActiveTab] = useState<'general' | 'checkout' | 'contact' | 'branding' | 'payment' | 'announcement'>('general')

  const fetchSettings = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/settings')
      const data = await res.json()
      if (data.success) {
        setSettings(data.data)
      }
    } catch {
      toast.error('Failed to load settings')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchSettings()
  }, [])

  const handleChange = (key: string, value: string) => {
    setSettings((prev) => ({ ...prev, [key]: value }))
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ settings }),
      })
      if (res.ok) {
        toast.success('Settings saved successfully!')
      } else {
        toast.error('Failed to save settings')
      }
    } catch {
      toast.error('Error saving settings')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <div className="p-12 text-center text-slate-400">Loading settings...</div>
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">Store Settings</h1>
          <p className="text-xs text-slate-500 mt-1">Configure your branding, contact info, payments, and site announcements</p>
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="btn btn-primary btn-sm rounded-xl flex items-center gap-1.5 self-start shadow-md"
        >
          <Save size={15} />
          <span>{saving ? 'Saving...' : 'Save Changes'}</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 gap-4 overflow-x-auto pb-1">
        {[
          { key: 'general', label: 'General & Currency' },
          { key: 'checkout', label: '🛒 Checkout Page (চেকআউট পেজ)' },
          { key: 'contact', label: 'Contact & Social' },
          { key: 'announcement', label: 'Announcement Bar' },
          { key: 'payment', label: 'Payment Gateways' },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as any)}
            className={`pb-3 text-xs font-bold border-b-2 transition-all whitespace-nowrap ${
              activeTab === tab.key
                ? 'border-emerald-600 text-emerald-700'
                : 'border-transparent text-slate-400 hover:text-slate-700'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Tab 1: General */}
        {activeTab === 'general' && (
          <div className="card p-6 space-y-4">
            <h3 className="text-sm font-extrabold text-slate-800 border-b border-slate-100 pb-2">
              Store Identity & Currency
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="form-label text-xs font-bold uppercase text-slate-700">Store Name</label>
                <input
                  type="text"
                  value={settings.site_name || ''}
                  onChange={(e) => handleChange('site_name', e.target.value)}
                  className="input text-xs rounded-xl"
                />
              </div>

              <div>
                <label className="form-label text-xs font-bold uppercase text-slate-700">Tagline / Slogan</label>
                <input
                  type="text"
                  value={settings.site_tagline || ''}
                  onChange={(e) => handleChange('site_tagline', e.target.value)}
                  className="input text-xs rounded-xl"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="form-label text-xs font-bold uppercase text-slate-700">Currency Symbol</label>
                <input
                  type="text"
                  value={settings.currency_symbol || '৳'}
                  onChange={(e) => handleChange('currency_symbol', e.target.value)}
                  className="input text-xs rounded-xl"
                />
              </div>

              <div>
                <label className="form-label text-xs font-bold uppercase text-slate-700">Currency Code</label>
                <input
                  type="text"
                  value={settings.currency || 'BDT'}
                  onChange={(e) => handleChange('currency', e.target.value)}
                  className="input text-xs rounded-xl"
                />
              </div>
            </div>

            <div>
              <label className="form-label text-xs font-bold uppercase text-slate-700">Footer About Summary</label>
              <textarea
                rows={3}
                value={settings.footer_about || ''}
                onChange={(e) => handleChange('footer_about', e.target.value)}
                className="input text-xs rounded-xl"
              />
            </div>
          </div>
        )}

        {/* Tab: Checkout Page Settings */}
        {activeTab === 'checkout' && (
          <div className="card p-6 space-y-6">
            <div>
              <h3 className="text-sm font-extrabold text-slate-900 border-b border-slate-100 pb-2">
                Checkout Page Header & Text (চেকআউট পেজ টেক্সট ও টাইটেল)
              </h3>
              <p className="text-xs text-slate-500 mt-1">কাস্টমার চেকআউট পেজে যেসব টাইটেল ও সাবটাইটেল দেখতে পাবে তা পরিবর্তন করুন</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="form-label text-xs font-bold uppercase text-slate-700">Checkout Title (প্রধান শিরোনাম)</label>
                <input
                  type="text"
                  placeholder="e.g. Checkout / আপনার অর্ডারটি সম্পন্ন করুন"
                  value={settings.checkout_title || ''}
                  onChange={(e) => handleChange('checkout_title', e.target.value)}
                  className="input text-xs rounded-xl"
                />
              </div>

              <div>
                <label className="form-label text-xs font-bold uppercase text-slate-700">Order Button Text (বাটন টেক্সট)</label>
                <input
                  type="text"
                  placeholder="e.g. Place Order (অর্ডার কনফার্ম করুন)"
                  value={settings.checkout_button_text || ''}
                  onChange={(e) => handleChange('checkout_button_text', e.target.value)}
                  className="input text-xs rounded-xl"
                />
              </div>
            </div>

            <div>
              <label className="form-label text-xs font-bold uppercase text-slate-700">Checkout Subtitle (উপশিরোনাম)</label>
              <input
                type="text"
                placeholder="e.g. Complete your order with Cash on Delivery or Mobile Banking"
                value={settings.checkout_subtitle || ''}
                onChange={(e) => handleChange('checkout_subtitle', e.target.value)}
                className="input text-xs rounded-xl"
              />
            </div>

            {/* Delivery Charges */}
            <div className="pt-2 border-t border-slate-100 space-y-4">
              <div>
                <h4 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider">
                  Default Delivery Fees & Free Delivery Threshold (ডেলিভারি চার্জ ও ফ্রি ডেলিভারি)
                </h4>
                <p className="text-[11px] text-slate-500 mt-0.5">ঢাকার ভেতরে ও বাইরে ডেলিভারি চার্জ নির্ধারণ করুন</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="form-label text-xs font-bold uppercase text-slate-700">Inside Dhaka (ঢাকার ভেতরে) ৳</label>
                  <input
                    type="number"
                    placeholder="60"
                    value={settings.delivery_inside_dhaka || ''}
                    onChange={(e) => handleChange('delivery_inside_dhaka', e.target.value)}
                    className="input text-xs rounded-xl"
                  />
                </div>

                <div>
                  <label className="form-label text-xs font-bold uppercase text-slate-700">Outside Dhaka (ঢাকার বাইরে) ৳</label>
                  <input
                    type="number"
                    placeholder="130"
                    value={settings.delivery_outside_dhaka || ''}
                    onChange={(e) => handleChange('delivery_outside_dhaka', e.target.value)}
                    className="input text-xs rounded-xl"
                  />
                </div>

                <div>
                  <label className="form-label text-xs font-bold uppercase text-slate-700">Free Delivery Minimum (৳)</label>
                  <input
                    type="number"
                    placeholder="999"
                    value={settings.free_delivery_threshold || ''}
                    onChange={(e) => handleChange('free_delivery_threshold', e.target.value)}
                    className="input text-xs rounded-xl"
                  />
                </div>
              </div>
            </div>

            {/* Notice / Promo Banner on Checkout */}
            <div className="pt-2 border-t border-slate-100 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider">
                    Checkout Promo Notice Banner (চেকআউট নোটিশ ব্যানার)
                  </h4>
                  <p className="text-[11px] text-slate-500">চেকআউট ফর্মের উপরে বিশেষ নোটিশ বা অফার দেখান</p>
                </div>
                <label className="flex items-center gap-2 text-xs font-bold cursor-pointer text-slate-800">
                  <input
                    type="checkbox"
                    checked={settings.checkout_show_notice !== 'false'}
                    onChange={(e) => handleChange('checkout_show_notice', e.target.checked ? 'true' : 'false')}
                    className="rounded text-emerald-600"
                  />
                  <span>Show Notice</span>
                </label>
              </div>

              <input
                type="text"
                placeholder="e.g. 🚚 সারা দেশে হোম ডেলিভারি ও পণ্য চেক করে মূল্য পরিশোধের সুবিধা!"
                value={settings.checkout_notice || ''}
                onChange={(e) => handleChange('checkout_notice', e.target.value)}
                className="input text-xs rounded-xl"
              />
            </div>

            {/* Trust Badges */}
            <div className="pt-2 border-t border-slate-100 space-y-3">
              <div>
                <h4 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider">
                  Trust Badges & Guarantees (৩টি কাস্টমার ট্রাস্ট পয়েন্ট)
                </h4>
                <p className="text-[11px] text-slate-500">অর্ডার বাটনের নিচে ৩টি বিশ্বস্ততার নিশ্চয়তা টেক্সট</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="form-label text-[11px] font-bold text-slate-700">Badge 1</label>
                  <input
                    type="text"
                    placeholder="১০০% নিরাপদ ডেলিভারি"
                    value={settings.checkout_trust_1 || ''}
                    onChange={(e) => handleChange('checkout_trust_1', e.target.value)}
                    className="input text-xs rounded-xl"
                  />
                </div>
                <div>
                  <label className="form-label text-[11px] font-bold text-slate-700">Badge 2</label>
                  <input
                    type="text"
                    placeholder="ক্যাশ অন ডেলিভারি (COD)"
                    value={settings.checkout_trust_2 || ''}
                    onChange={(e) => handleChange('checkout_trust_2', e.target.value)}
                    className="input text-xs rounded-xl"
                  />
                </div>
                <div>
                  <label className="form-label text-[11px] font-bold text-slate-700">Badge 3</label>
                  <input
                    type="text"
                    placeholder="পণ্য হাতে পেয়ে চেক করে পেমেন্ট"
                    value={settings.checkout_trust_3 || ''}
                    onChange={(e) => handleChange('checkout_trust_3', e.target.value)}
                    className="input text-xs rounded-xl"
                  />
                </div>
              </div>
            </div>

            {/* Form Field Toggles */}
            <div className="pt-2 border-t border-slate-100 space-y-3">
              <h4 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider">
                Form Fields Visibility (ফিল্ড হাইড / শো কন্ট্রোল)
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <label className="flex items-center gap-2 p-3 rounded-xl border border-slate-100 bg-slate-50 cursor-pointer text-xs font-bold text-slate-800">
                  <input
                    type="checkbox"
                    checked={settings.checkout_show_email !== 'false'}
                    onChange={(e) => handleChange('checkout_show_email', e.target.checked ? 'true' : 'false')}
                    className="rounded text-emerald-600"
                  />
                  <span>Email Field (ঐচ্ছিক ইমেইল)</span>
                </label>

                <label className="flex items-center gap-2 p-3 rounded-xl border border-slate-100 bg-slate-50 cursor-pointer text-xs font-bold text-slate-800">
                  <input
                    type="checkbox"
                    checked={settings.checkout_show_note !== 'false'}
                    onChange={(e) => handleChange('checkout_show_note', e.target.checked ? 'true' : 'false')}
                    className="rounded text-emerald-600"
                  />
                  <span>Delivery Note (ডেলিভারি নোট)</span>
                </label>

                <label className="flex items-center gap-2 p-3 rounded-xl border border-slate-100 bg-slate-50 cursor-pointer text-xs font-bold text-slate-800">
                  <input
                    type="checkbox"
                    checked={settings.checkout_show_coupon !== 'false'}
                    onChange={(e) => handleChange('checkout_show_coupon', e.target.checked ? 'true' : 'false')}
                    className="rounded text-emerald-600"
                  />
                  <span>Coupon Box (কুপন কোড বক্স)</span>
                </label>
              </div>
            </div>

            {/* Mobile Banking Instructions & Numbers */}
            <div className="pt-2 border-t border-slate-100 space-y-4">
              <div>
                <h4 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider">
                  Mobile Banking Accounts & Instructions (বিকাশ/নগদ নম্বর ও নির্দেশিকা)
                </h4>
                <p className="text-[11px] text-slate-500">চেকআউটে বিকাশ ও নগদ পেমেন্ট সিলেক্ট করলে কাস্টমারকে কোন নম্বর ও ইনস্ট্রাকশন দেখানো হবে</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2 p-3.5 rounded-2xl bg-rose-50/50 border border-rose-100">
                  <div className="font-bold text-xs text-rose-800">bKash (বিকাশ) Settings</div>
                  <div>
                    <label className="form-label text-[11px] font-bold text-slate-700">bKash Number</label>
                    <input
                      type="text"
                      placeholder="017XXXXXXXX"
                      value={settings.bkash_number || ''}
                      onChange={(e) => handleChange('bkash_number', e.target.value)}
                      className="input text-xs rounded-xl bg-white"
                    />
                  </div>
                  <div>
                    <label className="form-label text-[11px] font-bold text-slate-700">bKash Instructions</label>
                    <input
                      type="text"
                      placeholder="বিকাশ সেন্ড মানি বা পেমেন্ট করে ট্রানজেকশন আইডি দিন"
                      value={settings.bkash_note || ''}
                      onChange={(e) => handleChange('bkash_note', e.target.value)}
                      className="input text-xs rounded-xl bg-white"
                    />
                  </div>
                </div>

                <div className="space-y-2 p-3.5 rounded-2xl bg-orange-50/50 border border-orange-100">
                  <div className="font-bold text-xs text-orange-800">Nagad (নগদ) Settings</div>
                  <div>
                    <label className="form-label text-[11px] font-bold text-slate-700">Nagad Number</label>
                    <input
                      type="text"
                      placeholder="018XXXXXXXX"
                      value={settings.nagad_number || ''}
                      onChange={(e) => handleChange('nagad_number', e.target.value)}
                      className="input text-xs rounded-xl bg-white"
                    />
                  </div>
                  <div>
                    <label className="form-label text-[11px] font-bold text-slate-700">Nagad Instructions</label>
                    <input
                      type="text"
                      placeholder="নগদ সেন্ড মানি করে ট্রানজেকশন আইডি দিন"
                      value={settings.nagad_note || ''}
                      onChange={(e) => handleChange('nagad_note', e.target.value)}
                      className="input text-xs rounded-xl bg-white"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab: Contact */}
        {activeTab === 'contact' && (

          <div className="card p-6 space-y-4">
            <h3 className="text-sm font-extrabold text-slate-800 border-b border-slate-100 pb-2">
              Contact Details & Social Profiles
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="form-label text-xs font-bold uppercase text-slate-700">Support Phone Number</label>
                <input
                  type="text"
                  value={settings.contact_phone || ''}
                  onChange={(e) => handleChange('contact_phone', e.target.value)}
                  className="input text-xs rounded-xl"
                />
              </div>

              <div>
                <label className="form-label text-xs font-bold uppercase text-slate-700">WhatsApp Number</label>
                <input
                  type="text"
                  placeholder="+88017XXXXXXXX"
                  value={settings.whatsapp_number || ''}
                  onChange={(e) => handleChange('whatsapp_number', e.target.value)}
                  className="input text-xs rounded-xl"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="form-label text-xs font-bold uppercase text-slate-700">Support Email</label>
                <input
                  type="email"
                  value={settings.contact_email || ''}
                  onChange={(e) => handleChange('contact_email', e.target.value)}
                  className="input text-xs rounded-xl"
                />
              </div>

              <div>
                <label className="form-label text-xs font-bold uppercase text-slate-700">Facebook Page URL</label>
                <input
                  type="url"
                  value={settings.social_facebook || ''}
                  onChange={(e) => handleChange('social_facebook', e.target.value)}
                  className="input text-xs rounded-xl"
                />
              </div>
            </div>

            <div>
              <label className="form-label text-xs font-bold uppercase text-slate-700">Physical Office / Store Address</label>
              <input
                type="text"
                value={settings.contact_address || ''}
                onChange={(e) => handleChange('contact_address', e.target.value)}
                className="input text-xs rounded-xl"
              />
            </div>
          </div>
        )}

        {/* Tab 3: Announcement Bar */}
        {activeTab === 'announcement' && (
          <div className="card p-6 space-y-4">
            <h3 className="text-sm font-extrabold text-slate-800 border-b border-slate-100 pb-2">
              Top Header Announcement Bar
            </h3>

            <div className="space-y-4">
              <label className="flex items-center gap-2 text-xs font-bold cursor-pointer text-slate-800">
                <input
                  type="checkbox"
                  checked={settings.announcement_active === 'true'}
                  onChange={(e) => handleChange('announcement_active', e.target.checked ? 'true' : 'false')}
                  className="rounded text-emerald-600"
                />
                <span>Enable Announcement Bar</span>
              </label>

              <div>
                <label className="form-label text-xs font-bold uppercase text-slate-700">Announcement Banner Text</label>
                <input
                  type="text"
                  value={settings.announcement_text || ''}
                  onChange={(e) => handleChange('announcement_text', e.target.value)}
                  className="input text-xs rounded-xl"
                  placeholder="e.g. 🚚 Free delivery on orders above ৳999 | Cash on Delivery available"
                />
              </div>
            </div>
          </div>
        )}

        {/* Tab 4: Payment Gateways */}
        {activeTab === 'payment' && (
          <div className="card p-6 space-y-4">
            <h3 className="text-sm font-extrabold text-slate-800 border-b border-slate-100 pb-2">
              Supported Payment Methods
            </h3>

            <div className="space-y-3">
              <label className="flex items-center justify-between p-3 rounded-xl border border-slate-100 bg-slate-50 cursor-pointer">
                <div>
                  <div className="font-bold text-xs text-slate-900">Cash On Delivery (COD)</div>
                  <div className="text-[11px] text-slate-500">Allow customers to pay upon receiving items</div>
                </div>
                <input
                  type="checkbox"
                  checked={settings.payment_cod_enabled !== 'false'}
                  onChange={(e) => handleChange('payment_cod_enabled', e.target.checked ? 'true' : 'false')}
                  className="rounded text-emerald-600"
                />
              </label>

              <label className="flex items-center justify-between p-3 rounded-xl border border-slate-100 bg-slate-50 cursor-pointer">
                <div>
                  <div className="font-bold text-xs text-slate-900">bKash (বিকাশ) Payment</div>
                  <div className="text-[11px] text-slate-500">Enable bKash mobile payment instructions</div>
                </div>
                <input
                  type="checkbox"
                  checked={settings.payment_bkash_enabled === 'true'}
                  onChange={(e) => handleChange('payment_bkash_enabled', e.target.checked ? 'true' : 'false')}
                  className="rounded text-rose-600"
                />
              </label>

              <label className="flex items-center justify-between p-3 rounded-xl border border-slate-100 bg-slate-50 cursor-pointer">
                <div>
                  <div className="font-bold text-xs text-slate-900">Nagad (নগদ) Payment</div>
                  <div className="text-[11px] text-slate-500">Enable Nagad digital wallet checkout</div>
                </div>
                <input
                  type="checkbox"
                  checked={settings.payment_nagad_enabled === 'true'}
                  onChange={(e) => handleChange('payment_nagad_enabled', e.target.checked ? 'true' : 'false')}
                  className="rounded text-orange-600"
                />
              </label>
            </div>
          </div>
        )}

        <button
          type="submit"
          disabled={saving}
          className="btn btn-primary btn-lg rounded-2xl font-extrabold text-sm flex items-center gap-2 shadow-md"
        >
          <Save size={16} />
          <span>{saving ? 'Saving...' : 'Save All Settings'}</span>
        </button>
      </form>
    </div>
  )
}
