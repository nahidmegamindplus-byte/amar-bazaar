import { prisma } from '@/lib/prisma'
import { getCheckoutSettings } from '@/lib/settings'
import CheckoutClient from './CheckoutClient'

export const metadata = {
  title: 'Secure Checkout',
  description: 'Complete your order with Cash on Delivery or Mobile Banking.',
}

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function CheckoutPage() {
  const [deliveryZones, checkoutSettings] = await Promise.all([
    prisma.deliveryZone.findMany({
      where: { isActive: true },
      include: {
        rates: {
          where: { isActive: true },
        },
      },
    }),
    getCheckoutSettings(),
  ])

  return <CheckoutClient deliveryZones={deliveryZones} checkoutSettings={checkoutSettings} />
}

