import { Suspense } from 'react'
import OrderSuccessClient from './OrderSuccessClient'

export const metadata = {
  title: 'Order Confirmed - Thank You!',
  description: 'Thank you for your order at ShuddhoBazar. We are preparing your organic items.',
}

export default function OrderSuccessPage() {
  return (
    <Suspense fallback={<div className="container py-16 text-center text-slate-400">Loading order confirmation...</div>}>
      <OrderSuccessClient />
    </Suspense>
  )
}
