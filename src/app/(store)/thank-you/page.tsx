import { Suspense } from 'react'
import OrderSuccessClient from '../order-success/OrderSuccessClient'

export const metadata = {
  title: 'Thank You for Your Order!',
  description: 'Your order has been placed successfully at ShuddhoBazar.',
}

export default function ThankYouPage() {
  return (
    <Suspense fallback={<div className="container py-16 text-center text-slate-400">Loading order confirmation...</div>}>
      <OrderSuccessClient />
    </Suspense>
  )
}
