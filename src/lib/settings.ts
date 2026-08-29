import { prisma } from './prisma'

export async function getSetting(key: string, fallback = ''): Promise<string> {
  try {
    const setting = await prisma.setting.findUnique({ where: { key } })
    return setting?.value ?? fallback
  } catch {
    return fallback
  }
}

export async function getSettings(group?: string): Promise<Record<string, string>> {
  try {
    const settings = await prisma.setting.findMany({
      where: group ? { group } : undefined,
    })
    return Object.fromEntries(settings.map((s) => [s.key, s.value]))
  } catch {
    return {}
  }
}

export async function setSetting(key: string, value: string, group = 'general'): Promise<void> {
  await prisma.setting.upsert({
    where: { key },
    update: { value },
    create: { key, value, group },
  })
}

export async function getStoreName(): Promise<string> {
  return getSetting('site_name', 'ShuddhoBazar')
}

export async function getBrandingSettings() {
  const settings = await getSettings()
  return {
    siteName: settings.site_name || 'ShuddhoBazar',
    tagline: settings.site_tagline || 'Pure & Organic',
    logoUrl: settings.logo_url || '',
    faviconUrl: settings.favicon_url || '',
    primaryColor: settings.primary_color || '#16a34a',
    secondaryColor: settings.secondary_color || '#f97316',
    headerBg: settings.header_bg || '#ffffff',
    footerBg: settings.footer_bg || '#1a2e1a',
    phone: settings.contact_phone || '',
    email: settings.contact_email || '',
    address: settings.contact_address || '',
    whatsapp: settings.whatsapp_number || '',
    facebook: settings.social_facebook || '',
    instagram: settings.social_instagram || '',
    announcementText: settings.announcement_text || '',
    announcementActive: settings.announcement_active === 'true',
    currency: settings.currency || 'BDT',
    currencySymbol: settings.currency_symbol || '৳',
  }
}

export async function getCheckoutSettings() {
  const settings = await getSettings()
  return {
    checkoutTitle: settings.checkout_title || 'Checkout',
    checkoutSubtitle: settings.checkout_subtitle || 'Complete your order with Cash on Delivery or Mobile Banking',
    checkoutNotice: settings.checkout_notice || '🚚 সারা দেশে হোম ডেলিভারি ও পণ্য দেখে মূল্য পরিশোধের সুবিধা।',
    showNotice: settings.checkout_show_notice !== 'false',
    deliveryInsideDhaka: Number(settings.delivery_inside_dhaka) || 60,
    deliveryOutsideDhaka: Number(settings.delivery_outside_dhaka) || 130,
    freeDeliveryThreshold: Number(settings.free_delivery_threshold) || 999,
    showEmailField: settings.checkout_show_email !== 'false',
    showDeliveryNote: settings.checkout_show_note !== 'false',
    showCouponBox: settings.checkout_show_coupon !== 'false',
    orderButtonText: settings.checkout_button_text || 'Place Order (অর্ডার কনফার্ম করুন)',
    trustBadge1: settings.checkout_trust_1 || '১০০% নিরাপদ ডেলিভারি',
    trustBadge2: settings.checkout_trust_2 || 'ক্যাশ অন ডেলিভারি (COD)',
    trustBadge3: settings.checkout_trust_3 || 'পণ্য হাতে পেয়ে চেক করে পেমেন্ট',
    bkashNumber: settings.bkash_number || '',
    bkashNote: settings.bkash_note || 'বিকাশ সেন্ড মানি বা পেমেন্ট করে ট্রানজেকশন আইডি দিন',
    nagadNumber: settings.nagad_number || '',
    nagadNote: settings.nagad_note || 'নগদ সেন্ড মানি করে ট্রানজেকশন আইডি দিন',
    rocketNumber: settings.rocket_number || '',
    rocketNote: settings.rocket_note || 'রকেট সেন্ড মানি করে ট্রানজেকশন আইডি দিন',
  }
}

