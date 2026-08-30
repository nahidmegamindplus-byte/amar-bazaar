import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding ShuddhoBazar database...')

  // ============================================================
  // SETTINGS
  // ============================================================
  const settings = [
    // General
    { key: 'site_name', value: 'ShuddhoBazar', group: 'general' },
    { key: 'site_tagline', value: 'Pure & Organic Grocery from Bangladesh', group: 'general' },
    { key: 'site_description', value: 'Premium organic grocery, honey, spices, and natural foods delivered to your doorstep across Bangladesh.', group: 'general' },
    { key: 'currency', value: 'BDT', group: 'general' },
    { key: 'currency_symbol', value: '৳', group: 'general' },
    { key: 'timezone', value: 'Asia/Dhaka', group: 'general' },
    { key: 'language', value: 'en', group: 'general' },
    { key: 'maintenance_mode', value: 'false', group: 'general' },
    // Contact
    { key: 'contact_phone', value: '+880-1234-567890', group: 'contact' },
    { key: 'contact_email', value: 'support@shuddhobazar.com', group: 'contact' },
    { key: 'contact_address', value: 'House 12, Road 5, Dhanmondi, Dhaka 1205, Bangladesh', group: 'contact' },
    { key: 'whatsapp_number', value: '+8801234567890', group: 'contact' },
    // Branding
    { key: 'logo_url', value: '', group: 'branding' },
    { key: 'favicon_url', value: '', group: 'branding' },
    { key: 'primary_color', value: '#16a34a', group: 'branding' },
    { key: 'secondary_color', value: '#f97316', group: 'branding' },
    { key: 'header_bg', value: '#ffffff', group: 'branding' },
    { key: 'footer_bg', value: '#1a2e1a', group: 'branding' },
    // Social
    { key: 'social_facebook', value: 'https://facebook.com/shuddhobazar', group: 'social' },
    { key: 'social_instagram', value: 'https://instagram.com/shuddhobazar', group: 'social' },
    { key: 'social_youtube', value: '', group: 'social' },
    { key: 'social_twitter', value: '', group: 'social' },
    // Announcement
    { key: 'announcement_text', value: '🚚 Free delivery on orders above ৳999 | Cash on Delivery available', group: 'announcement' },
    { key: 'announcement_active', value: 'true', group: 'announcement' },
    // SEO
    { key: 'seo_title', value: 'ShuddhoBazar - Pure & Organic Grocery Bangladesh', group: 'seo' },
    { key: 'seo_description', value: 'Shop 100% pure and organic honey, spices, oils, dates, nuts, and more from ShuddhoBazar. Fast delivery across Bangladesh.', group: 'seo' },
    { key: 'seo_keywords', value: 'organic grocery bangladesh, pure honey, mustard oil, dates, spices, natural food', group: 'seo' },
    // Payment
    { key: 'payment_cod_enabled', value: 'true', group: 'payment' },
    { key: 'payment_bkash_enabled', value: 'false', group: 'payment' },
    { key: 'payment_nagad_enabled', value: 'false', group: 'payment' },
    { key: 'payment_rocket_enabled', value: 'false', group: 'payment' },
    { key: 'payment_online_enabled', value: 'false', group: 'payment' },
    // Email
    { key: 'email_order_confirmation', value: 'true', group: 'email' },
    { key: 'email_shipping_update', value: 'true', group: 'email' },
    // Tax
    { key: 'tax_enabled', value: 'false', group: 'tax' },
    { key: 'tax_percentage', value: '0', group: 'tax' },
    // Footer
    { key: 'footer_about', value: 'ShuddhoBazar brings you the finest organic and natural foods sourced directly from Bangladeshi farmers and trusted suppliers. We believe in purity, quality, and trust.', group: 'footer' },
  ]

  for (const setting of settings) {
    await prisma.setting.upsert({
      where: { key: setting.key },
      update: {},
      create: { key: setting.key, value: setting.value, group: setting.group },
    })
  }
  console.log('✅ Settings seeded')

  // ============================================================
  // ADMIN USER
  // ============================================================
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@shuddho.com'
  const adminPassword = process.env.ADMIN_PASSWORD || 'Admin@123456'
  const adminName = process.env.ADMIN_NAME || 'Super Admin'

  const existingAdmin = await prisma.user.findFirst({ where: { email: adminEmail } })
  if (!existingAdmin) {
    const hashedPassword = await bcrypt.hash(adminPassword, 12)
    const admin = await prisma.user.create({
      data: {
        email: adminEmail,
        name: adminName,
        phone: '01700000001',
        password: hashedPassword,
        role: 'SUPER_ADMIN',
        status: 'ACTIVE',
        emailVerified: true,
        phoneVerified: true,
        adminProfile: {
          create: {
            permissions: JSON.stringify(['*']),
          },
        },
      },
    })
    console.log(`✅ Admin user created: ${adminEmail}`)
    console.log(`   Password: ${adminPassword}`)
  } else {
    console.log('ℹ️  Admin user already exists')
  }

  // Demo Customer User
  const customerEmail = 'user@shuddho.com'
  const customerPhone = '01700000000'
  const existingCustomer = await prisma.user.findFirst({ where: { OR: [{ email: customerEmail }, { phone: customerPhone }] } })
  if (!existingCustomer) {
    const hashedPassword = await bcrypt.hash('User@123456', 12)
    await prisma.user.create({
      data: {
        email: customerEmail,
        phone: customerPhone,
        name: 'Demo Customer',
        password: hashedPassword,
        role: 'CUSTOMER',
        status: 'ACTIVE',
        emailVerified: true,
        phoneVerified: true,
        cart: { create: {} },
        wishlist: { create: {} },
        addresses: {
          create: {
            name: 'Demo Customer',
            phone: '01700000000',
            division: 'Dhaka',
            district: 'Dhaka',
            area: 'Dhanmondi',
            fullAddress: 'House 12, Road 5, Dhanmondi, Dhaka',
            isDefault: true,
          }
        }
      }
    })
    console.log(`✅ Demo Customer created: ${customerEmail} / ${customerPhone}`)
  }

  // ============================================================
  // DELIVERY ZONES
  // ============================================================
  const dhaka = await prisma.deliveryZone.upsert({
    where: { id: 'zone-dhaka' },
    update: {},
    create: {
      id: 'zone-dhaka',
      name: 'Dhaka',
      description: 'Dhaka Metropolitan Area',
      isActive: true,
      rates: {
        create: [
          { name: 'Inside Dhaka City', charge: 60, freeThreshold: 999, estimatedDays: '1-2 days', isActive: true },
          { name: 'Dhaka Outskirts', charge: 100, freeThreshold: 1499, estimatedDays: '2-3 days', isActive: true },
        ]
      }
    },
  })

  await prisma.deliveryZone.upsert({
    where: { id: 'zone-outside-dhaka' },
    update: {},
    create: {
      id: 'zone-outside-dhaka',
      name: 'Outside Dhaka',
      description: 'All other divisions',
      isActive: true,
      rates: {
        create: [
          { name: 'Chittagong Division', charge: 120, freeThreshold: 1999, estimatedDays: '3-5 days', isActive: true },
          { name: 'Sylhet Division', charge: 130, freeThreshold: 1999, estimatedDays: '3-5 days', isActive: true },
          { name: 'Rajshahi Division', charge: 130, freeThreshold: 1999, estimatedDays: '3-5 days', isActive: true },
          { name: 'Khulna Division', charge: 130, freeThreshold: 1999, estimatedDays: '3-5 days', isActive: true },
          { name: 'Barisal Division', charge: 140, freeThreshold: 1999, estimatedDays: '4-6 days', isActive: true },
          { name: 'Rangpur Division', charge: 140, freeThreshold: 1999, estimatedDays: '4-6 days', isActive: true },
          { name: 'Mymensingh Division', charge: 120, freeThreshold: 1999, estimatedDays: '3-4 days', isActive: true },
        ]
      }
    },
  })
  console.log('✅ Delivery zones seeded')

  // ============================================================
  // HOMEPAGE SECTIONS
  // ============================================================
  const homeSections = [
    { type: 'HERO_SLIDER', heading: 'Pure & Organic', subheading: 'From Farm to Your Table', sortOrder: 1, isActive: true, showOnMobile: true, showOnDesktop: true, productCount: 0, config: '{}' },
    { type: 'FEATURED_CATEGORIES', heading: 'Shop by Category', subheading: 'Explore our wide range of organic products', sortOrder: 2, isActive: true, showOnMobile: true, showOnDesktop: true, productCount: 8, config: '{}' },
    { type: 'FLASH_SALE', heading: 'Flash Sale', subheading: 'Limited time offers — grab before it\'s gone!', sortOrder: 3, isActive: true, showOnMobile: true, showOnDesktop: true, productCount: 6, config: '{}' },
    { type: 'TOP_SELLERS', heading: 'Top Selling', subheading: 'Products our customers love the most', sortOrder: 4, isActive: true, productSource: 'BEST_SELLING', showOnMobile: true, showOnDesktop: true, productCount: 8, config: '{}' },
    { type: 'NEW_ARRIVALS', heading: 'New Arrivals', subheading: 'Just landed — fresh stock for you', sortOrder: 5, isActive: true, productSource: 'NEW_ARRIVAL', showOnMobile: true, showOnDesktop: true, productCount: 8, config: '{}' },
    { type: 'COMBO_DEALS', heading: 'Combo Deals', subheading: 'Save more with our value bundles', sortOrder: 6, isActive: true, showOnMobile: true, showOnDesktop: true, productCount: 4, config: '{}' },
    { type: 'BRANDS', heading: 'Featured Brands', subheading: 'Trusted brands we carry', sortOrder: 7, isActive: true, showOnMobile: false, showOnDesktop: true, productCount: 6, config: '{}' },
    { type: 'ORGANIC', heading: 'Organic & Certified', subheading: '100% natural — no additives, no preservatives', sortOrder: 8, isActive: true, productSource: 'FEATURED', showOnMobile: true, showOnDesktop: true, productCount: 8, config: '{}' },
    { type: 'PROMO_BANNER', heading: '', subheading: '', sortOrder: 9, isActive: true, showOnMobile: true, showOnDesktop: true, productCount: 0, config: '{}' },
    { type: 'BLOG', heading: 'Stories & Recipes', subheading: 'Tips, recipes, and guides for a healthier life', sortOrder: 10, isActive: true, showOnMobile: false, showOnDesktop: true, productCount: 3, config: '{}' },
    { type: 'NEWSLETTER', heading: 'Join Our Community', subheading: 'Get exclusive offers and organic living tips straight to your inbox', sortOrder: 11, isActive: true, showOnMobile: true, showOnDesktop: true, productCount: 0, config: '{}' },
  ]

  for (const section of homeSections) {
    const existing = await prisma.homepageSection.findFirst({ where: { type: section.type } })
    if (!existing) {
      await prisma.homepageSection.create({ data: section })
    }
  }
  console.log('✅ Homepage sections seeded')

  // ============================================================
  // MENUS
  // ============================================================
  const headerMenu = await prisma.menu.upsert({
    where: { location: 'HEADER' },
    update: {},
    create: {
      name: 'Header Navigation',
      location: 'HEADER',
      items: {
        create: [
          { label: 'Home', type: 'CUSTOM', url: '/', sortOrder: 1, isActive: true },
          { label: 'Shop', type: 'CUSTOM', url: '/shop', sortOrder: 2, isActive: true },
          { label: 'Categories', type: 'CUSTOM', url: '/categories', sortOrder: 3, isActive: true },
          { label: 'Combos', type: 'CUSTOM', url: '/combos', sortOrder: 4, isActive: true },
          { label: 'Offers', type: 'CUSTOM', url: '/offers', sortOrder: 5, isActive: true },
          { label: 'New Arrivals', type: 'CUSTOM', url: '/new-arrivals', sortOrder: 6, isActive: true },
          { label: 'Best Sellers', type: 'CUSTOM', url: '/best-sellers', sortOrder: 7, isActive: true },
          { label: 'Flash Sale', type: 'CUSTOM', url: '/flash-sale', sortOrder: 8, isActive: true },
        ]
      }
    },
  })

  await prisma.menu.upsert({
    where: { location: 'FOOTER' },
    update: {},
    create: {
      name: 'Footer Navigation',
      location: 'FOOTER',
    },
  })

  await prisma.menu.upsert({
    where: { location: 'MOBILE' },
    update: {},
    create: {
      name: 'Mobile Navigation',
      location: 'MOBILE',
    },
  })
  console.log('✅ Menus seeded')

  // ============================================================
  // CMS PAGES
  // ============================================================
  const pages = [
    { title: 'About Us', slug: 'about-us', content: '<h1>About ShuddhoBazar</h1><p>ShuddhoBazar is Bangladesh\'s premium online grocery store specializing in pure organic products sourced directly from trusted local farmers and producers. We believe that every family deserves access to 100% natural, additive-free foods that nourish the body and soul.</p><h2>Our Mission</h2><p>To make pure, organic, and sustainably sourced food accessible to every Bangladeshi household — with transparency, trust, and exceptional quality.</p><h2>Why Choose Us</h2><ul><li>100% authentic products with source verification</li><li>Direct from farmer partnerships</li><li>No artificial preservatives or additives</li><li>Fast, reliable delivery across Bangladesh</li><li>30-day return policy</li></ul>' },
    { title: 'Contact Us', slug: 'contact-us', content: '<h1>Contact Us</h1><p>We\'re here to help! Reach out to our friendly customer support team.</p><h2>Get In Touch</h2><p><strong>Phone:</strong> +880-1234-567890<br/><strong>Email:</strong> support@shuddhobazar.com<br/><strong>WhatsApp:</strong> +880-1234-567890</p><h2>Office Hours</h2><p>Saturday – Thursday: 9:00 AM – 9:00 PM<br/>Friday: 2:00 PM – 9:00 PM</p><h2>Office Address</h2><p>House 12, Road 5, Dhanmondi, Dhaka 1205, Bangladesh</p>' },
    { title: 'FAQ', slug: 'faq', content: '<h1>Frequently Asked Questions</h1><h2>Ordering</h2><h3>How do I place an order?</h3><p>Browse our products, add items to your cart, and proceed to checkout. You can pay via Cash on Delivery, bKash, Nagad, or Rocket.</p><h3>Can I cancel my order?</h3><p>You can cancel your order within 2 hours of placing it by contacting our support team.</p><h2>Delivery</h2><h3>How long does delivery take?</h3><p>Dhaka: 1-2 business days. Outside Dhaka: 3-6 business days.</p><h3>Is there a free delivery threshold?</h3><p>Yes! Free delivery on orders above ৳999 within Dhaka.</p><h2>Returns & Refunds</h2><h3>What is your return policy?</h3><p>We offer a 30-day return policy for damaged or incorrect items.</p>' },
    { title: 'Return Policy', slug: 'return-policy', content: '<h1>Return Policy</h1><p>We want you to be completely satisfied with your purchase. If you\'re not happy with your order, we\'re here to help.</p><h2>Return Eligibility</h2><ul><li>Item must be returned within 30 days of purchase</li><li>Item must be in original condition and packaging</li><li>Food items may only be returned if damaged, expired, or incorrect</li></ul><h2>How to Return</h2><p>Contact our support team at support@shuddhobazar.com or call +880-1234-567890 with your order number and reason for return.</p><h2>Refund Process</h2><p>Approved refunds are processed within 5-7 business days to your original payment method.</p>' },
    { title: 'Privacy Policy', slug: 'privacy-policy', content: '<h1>Privacy Policy</h1><p>ShuddhoBazar is committed to protecting your privacy. This policy explains how we collect, use, and safeguard your personal information.</p><h2>Information We Collect</h2><ul><li>Name, email, phone number</li><li>Delivery address</li><li>Order and payment history</li><li>Device and browsing information</li></ul><h2>How We Use Your Information</h2><ul><li>To process and deliver your orders</li><li>To send order updates and notifications</li><li>To improve our products and services</li><li>To send promotional offers (with your consent)</li></ul><h2>Data Security</h2><p>We use industry-standard encryption and security measures to protect your personal data.</p>' },
    { title: 'Terms & Conditions', slug: 'terms-and-conditions', content: '<h1>Terms & Conditions</h1><p>By using ShuddhoBazar, you agree to the following terms and conditions.</p><h2>Use of Service</h2><p>You must be at least 18 years old to create an account. You are responsible for maintaining the confidentiality of your account credentials.</p><h2>Products & Pricing</h2><p>All prices are in Bangladeshi Taka (৳). Prices may change without prior notice. We reserve the right to cancel orders if pricing errors occur.</p><h2>Payments</h2><p>We accept Cash on Delivery, bKash, Nagad, and Rocket. Payment must be made in full before order fulfillment (except COD).</p><h2>Limitation of Liability</h2><p>ShuddhoBazar is not liable for any indirect, incidental, or consequential damages arising from the use of our platform.</p>' },
    { title: 'Shipping Information', slug: 'shipping', content: '<h1>Shipping Information</h1><h2>Delivery Areas</h2><p>We deliver across all 64 districts of Bangladesh.</p><h2>Delivery Timeframes</h2><ul><li>Inside Dhaka City: 1-2 business days (৳60)</li><li>Dhaka Outskirts: 2-3 business days (৳100)</li><li>Other Divisions: 3-6 business days (৳120-৳140)</li></ul><h2>Free Delivery</h2><p>Orders above ৳999 qualify for free delivery within Dhaka.</p><h2>Same-Day Delivery</h2><p>Available in selected areas of Dhaka for orders placed before 12:00 PM. Additional charges apply.</p>' },
    { title: 'Refund Policy', slug: 'refund-policy', content: '<h1>Refund Policy</h1><p>We offer full refunds for items that are damaged, incorrect, or expired upon delivery.</p><h2>Refund Eligibility</h2><ul><li>Damaged items must be reported within 24 hours of delivery</li><li>Photos of the damaged item are required</li><li>Refunds are not available for perishable items once delivered in good condition</li></ul><h2>Refund Methods</h2><p>Refunds are issued to the original payment method (bKash/Nagad/Rocket account or via Cash).</p>' },
    { title: 'How to Order', slug: 'how-to-order', content: '<h1>How to Order</h1><p>Ordering from ShuddhoBazar is simple and easy!</p><h2>Step 1: Browse Products</h2><p>Use our search, categories, or browse featured products to find what you\'re looking for.</p><h2>Step 2: Add to Cart</h2><p>Select your desired quantity and variation, then click "Add to Cart".</p><h2>Step 3: Checkout</h2><p>Enter your delivery address, choose your preferred payment method, and place your order.</p><h2>Step 4: Confirmation</h2><p>You\'ll receive an order confirmation via email/phone. We\'ll keep you updated on your delivery status.</p><h2>Step 5: Receive Your Order</h2><p>Our delivery team will bring your order to your doorstep!</p>' },
  ]

  for (const page of pages) {
    await prisma.page.upsert({
      where: { slug: page.slug },
      update: {},
      create: { ...page, isPublished: true },
    })
  }
  console.log('✅ CMS pages seeded')

  // ============================================================
  // EMAIL TEMPLATES
  // ============================================================
  const emailTemplates = [
    {
      key: 'ORDER_CONFIRMATION',
      subject: 'Order Confirmed - {{orderNumber}} | ShuddhoBazar',
      body: '<h2>Thank you for your order!</h2><p>Dear {{customerName}},</p><p>Your order <strong>{{orderNumber}}</strong> has been confirmed.</p><p><strong>Total: ৳{{total}}</strong></p><p>We will notify you once your order is shipped.</p><p>Track your order at: {{trackingUrl}}</p>',
      isActive: true,
    },
    {
      key: 'ORDER_SHIPPED',
      subject: 'Your order {{orderNumber}} is on the way! | ShuddhoBazar',
      body: '<h2>Your order is shipped!</h2><p>Dear {{customerName}},</p><p>Great news! Your order <strong>{{orderNumber}}</strong> has been shipped.</p><p>Tracking Number: {{trackingNumber}}</p><p>Expected delivery: {{estimatedDelivery}}</p>',
      isActive: true,
    },
    {
      key: 'WELCOME',
      subject: 'Welcome to ShuddhoBazar! 🌿',
      body: '<h2>Welcome to ShuddhoBazar!</h2><p>Dear {{name}},</p><p>Thank you for joining ShuddhoBazar. We\'re excited to have you!</p><p>Start shopping our pure organic products at: {{shopUrl}}</p>',
      isActive: true,
    },
    {
      key: 'PASSWORD_RESET',
      subject: 'Reset your ShuddhoBazar password',
      body: '<h2>Password Reset Request</h2><p>Dear {{name}},</p><p>Click the link below to reset your password:</p><p><a href="{{resetUrl}}">Reset Password</a></p><p>This link expires in 1 hour.</p><p>If you didn\'t request this, please ignore this email.</p>',
      isActive: true,
    },
  ]

  for (const template of emailTemplates) {
    await prisma.emailTemplate.upsert({
      where: { key: template.key },
      update: {},
      create: template,
    })
  }
  console.log('✅ Email templates seeded')

  console.log('\n🎉 ShuddhoBazar database seeded successfully!')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log(`📧 Admin Email:    ${process.env.ADMIN_EMAIL || 'admin@shuddho.com'}`)
  console.log(`🔑 Admin Password: ${process.env.ADMIN_PASSWORD || 'Admin@123456'}`)
  console.log(`🌐 Start server:   npm run dev`)
  console.log(`🔧 Admin Panel:    http://localhost:3000/admin`)
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
}

main()
  .catch((e) => {
    console.error('❌ Seed error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
