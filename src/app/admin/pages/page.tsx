'use client'
import { useState, useEffect } from 'react'
import { FileText, Edit, Plus } from 'lucide-react'
import { formatDate } from '@/lib/utils'

export default function AdminPagesManager() {
  const [pages, setPages] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setPages([
      { id: '1', title: 'About Us (আমাদের সম্পর্কে)', slug: 'about-us', isPublished: true, updatedAt: new Date() },
      { id: '2', title: 'FAQ (সাধারণ জিজ্ঞাসা)', slug: 'faq', isPublished: true, updatedAt: new Date() },
      { id: '3', title: 'Privacy Policy (গোপনীয়তা নীতি)', slug: 'privacy-policy', isPublished: true, updatedAt: new Date() },
      { id: '4', title: 'Terms & Conditions (শর্তাবলী)', slug: 'terms-and-conditions', isPublished: true, updatedAt: new Date() },
      { id: '5', title: 'Return & Refund Policy (রিটার্ন নীতি)', slug: 'return-policy', isPublished: true, updatedAt: new Date() },
    ])
    setLoading(false)
  }, [])

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900">CMS Pages Manager</h1>
        <p className="text-xs text-slate-500 mt-1">Manage static legal, policy, and information pages of your store</p>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>Page Title</th>
                <th>Slug URL</th>
                <th>Status</th>
                <th>Last Updated</th>
              </tr>
            </thead>
            <tbody>
              {pages.map((p) => (
                <tr key={p.id}>
                  <td className="font-bold text-slate-800 text-sm">{p.title}</td>
                  <td className="text-xs text-slate-500 font-mono">/pages/{p.slug}</td>
                  <td><span className="badge badge-green">Published</span></td>
                  <td className="text-xs text-slate-400">{formatDate(p.updatedAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
