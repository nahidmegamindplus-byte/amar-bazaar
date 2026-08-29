'use client'
import { useState, useEffect } from 'react'
import { Star, Check, X, Trash2 } from 'lucide-react'
import toast from 'react-hot-toast'

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // sample reviews data
    setReviews([
      { id: '1', author: 'Naimul Islam', product: 'Sundarban Raw Honey', rating: 5, body: '100% pure authentic honey. Best quality in Bangladesh!', status: 'APPROVED' },
      { id: '2', author: 'Sadia Rahman', product: 'Cold-Pressed Mustard Oil', rating: 5, body: 'The pungent aroma (ঝাঁঝ) is amazing for bhortas. Very fresh.', status: 'APPROVED' },
      { id: '3', author: 'Kamrul Hasan', product: 'Pabna Desi Cow Ghee', rating: 5, body: 'Great granular texture and aroma. Recommended!', status: 'APPROVED' },
    ])
    setLoading(false)
  }, [])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900">Customer Reviews Moderation</h1>
        <p className="text-xs text-slate-500 mt-1">Approve, feature, or remove verified customer reviews</p>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>Customer</th>
                <th>Product</th>
                <th>Rating</th>
                <th>Feedback</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {reviews.map((r) => (
                <tr key={r.id}>
                  <td className="font-bold text-slate-800">{r.author}</td>
                  <td className="text-xs font-semibold text-emerald-700">{r.product}</td>
                  <td>
                    <div className="flex text-amber-500">
                      {Array.from({ length: r.rating }).map((_, i) => (
                        <Star key={i} size={12} fill="currentColor" />
                      ))}
                    </div>
                  </td>
                  <td className="text-xs text-slate-600 max-w-sm">{r.body}</td>
                  <td><span className="badge badge-green font-bold text-xs">{r.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
