import { prisma } from '@/lib/prisma'
import { fallbackDeliveryZones } from '@/lib/fallback-data'
import { getCheckoutSettings } from '@/lib/settings'
import CheckoutClient from './CheckoutClient'

export const metadata = {
  title: 'Secure Checkout',
  description: 'Complete your order with Cash on Delivery or Mobile Banking.',
}

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function CheckoutPage() {
  const checkoutSettings = await getCheckoutSettings()
  let deliveryZones: any[] = fallbackDeliveryZones

  try {
    const dbZones = await prisma.deliveryZone.findMany({
      where: { isActive: true },
      include: {
        rates: {
          where: { isActive: true },
        },
      },
    })
    if (dbZones?.length) deliveryZones = dbZones
  } catch {
    // Fallback safely
  }

  return <CheckoutClient deliveryZones={deliveryZones} checkoutSettings={checkoutSettings} />
}

