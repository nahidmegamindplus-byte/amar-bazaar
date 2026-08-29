import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Enhancing ShuddhoBazar with realistic organic products & categories...')

  // 1. Categories
  const categoriesData = [
    {
      name: 'Pure Honey (মধু)',
      slug: 'pure-honey',
      description: '100% natural, raw & unprocessed honey directly sourced from Sundarban and Mustard flowers.',
      image: 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?auto=format&fit=crop&w=600&q=80',
      banner: 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?auto=format&fit=crop&w=1200&q=80',
      sortOrder: 1,
      subcategories: [
        { name: 'Sundarban Raw Honey', slug: 'sundarban-raw-honey' },
        { name: 'Mustard Flower Honey', slug: 'mustard-flower-honey' },
        { name: 'Litchi Flower Honey', slug: 'litchi-flower-honey' },
        { name: 'Black Seed (Kalojira) Honey', slug: 'kalojira-honey' },
      ]
    },
    {
      name: 'Cold Pressed Oils (তেল)',
      slug: 'cold-pressed-oils',
      description: 'Traditional wood-pressed (Ghani-bhanga) pure edible oils for healthy cooking.',
      image: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&w=600&q=80',
      banner: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&w=1200&q=80',
      sortOrder: 2,
      subcategories: [
        { name: 'Extra Virgin Mustard Oil', slug: 'mustard-oil' },
        { name: 'Cold Pressed Coconut Oil', slug: 'coconut-oil' },
        { name: 'Black Seed (Kalojira) Oil', slug: 'kalojira-oil' },
        { name: 'Extra Virgin Olive Oil', slug: 'olive-oil' },
      ]
    },
    {
      name: 'Organic Ghee & Dairy (ঘি)',
      slug: 'organic-ghee-dairy',
      description: 'Traditional Bilona & Grass-Fed pure cow milk ghee with aromatic granulations.',
      image: 'https://images.unsplash.com/photo-1628088062854-d1870b4553da?auto=format&fit=crop&w=600&q=80',
      banner: 'https://images.unsplash.com/photo-1628088062854-d1870b4553da?auto=format&fit=crop&w=1200&q=80',
      sortOrder: 3,
      subcategories: [
        { name: 'Pabna Desi Cow Ghee', slug: 'pabna-desi-cow-ghee' },
        { name: 'A2 Vedic Bilona Ghee', slug: 'a2-vedic-ghee' },
        { name: 'Buffalo Ghee', slug: 'buffalo-ghee' },
      ]
    },
    {
      name: 'Premium Nuts & Dates (বাদাম ও খেজুর)',
      slug: 'nuts-and-dates',
      description: 'Handpicked premium grade Medjool, Ajwa dates, and raw crunchy dry fruits.',
      image: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&w=600&q=80',
      banner: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&w=1200&q=80',
      sortOrder: 4,
      subcategories: [
        { name: 'Ajwa Al-Madinah Dates', slug: 'ajwa-dates' },
        { name: 'Medjool Jumbo Dates', slug: 'medjool-dates' },
        { name: 'California Almonds & Walnuts', slug: 'almonds-walnuts' },
        { name: 'Cashew & Pistachio', slug: 'cashew-pistachio' },
      ]
    },
    {
      name: 'Organic Spices & Herbs (মশলা)',
      slug: 'spices-and-herbs',
      description: 'Pure sun-dried stone-ground turmeric, chili, cumin, and hill-tract spices.',
      image: 'https://images.unsplash.com/photo-1596040033282-be29f79efbb9?auto=format&fit=crop&w=600&q=80',
      banner: 'https://images.unsplash.com/photo-1596040033282-be29f79efbb9?auto=format&fit=crop&w=1200&q=80',
      sortOrder: 5,
      subcategories: [
        { name: 'Hill Tracts Pure Turmeric Powder', slug: 'turmeric-powder' },
        { name: 'Red Chili Powder', slug: 'red-chili-powder' },
        { name: 'Kashmiri Organic Saffron', slug: 'saffron' },
        { name: 'Whole Garam Masala Mix', slug: 'garam-masala' },
      ]
    },
    {
      name: 'Seeds & Superfoods (সুপারফুড)',
      slug: 'seeds-and-superfoods',
      description: 'Nutrient-rich Chia seeds, Pumpkin seeds, and organic Moringa leaf powder.',
      image: 'https://images.unsplash.com/photo-1508746829417-e6f548d8d6ed?auto=format&fit=crop&w=600&q=80',
      banner: 'https://images.unsplash.com/photo-1508746829417-e6f548d8d6ed?auto=format&fit=crop&w=1200&q=80',
      sortOrder: 6,
      subcategories: [
        { name: 'Organic Chia Seeds', slug: 'chia-seeds' },
        { name: 'Pumpkin & Sunflower Seeds', slug: 'pumpkin-seeds' },
        { name: 'Moringa Leaf Powder', slug: 'moringa-powder' },
        { name: 'Spirulina & Wheatgrass', slug: 'spirulina' },
      ]
    }
  ]

  for (const cat of categoriesData) {
    const createdCat = await prisma.category.upsert({
      where: { slug: cat.slug },
      update: {
        name: cat.name,
        description: cat.description,
        image: cat.image,
        banner: cat.banner,
        sortOrder: cat.sortOrder,
        isActive: true,
      },
      create: {
        name: cat.name,
        slug: cat.slug,
        description: cat.description,
        image: cat.image,
        banner: cat.banner,
        sortOrder: cat.sortOrder,
        isActive: true,
      }
    })

    for (const sub of cat.subcategories) {
      await prisma.subCategory.upsert({
        where: { slug: sub.slug },
        update: { name: sub.name, categoryId: createdCat.id, isActive: true },
        create: { name: sub.name, slug: sub.slug, categoryId: createdCat.id, isActive: true }
      })
    }
  }
  console.log('✅ Categories and Subcategories populated')

  // 2. Brands
  const brandsData = [
    { name: 'Shuddho Farm Fresh', slug: 'shuddho-farm-fresh', description: 'Our in-house verified organic direct-from-farm products.' },
    { name: 'Sundarban Native', slug: 'sundarban-native', description: 'Wild harvested pure honey and forest produce.' },
    { name: 'Borno Organics', slug: 'borno-organics', description: 'Authentic traditional Ghani pressed pure oils.' },
    { name: 'Arabian Palms', slug: 'arabian-palms', description: 'Direct import of grade-A Madina dates.' },
  ]

  for (const brand of brandsData) {
    await prisma.brand.upsert({
      where: { slug: brand.slug },
      update: brand,
      create: brand,
    })
  }
  console.log('✅ Brands populated')

  // 3. Products
  const catHoney = await prisma.category.findUnique({ where: { slug: 'pure-honey' } })
  const catOil = await prisma.category.findUnique({ where: { slug: 'cold-pressed-oils' } })
  const catGhee = await prisma.category.findUnique({ where: { slug: 'organic-ghee-dairy' } })
  const catNuts = await prisma.category.findUnique({ where: { slug: 'nuts-and-dates' } })
  const catSpices = await prisma.category.findUnique({ where: { slug: 'spices-and-herbs' } })
  const catSeeds = await prisma.category.findUnique({ where: { slug: 'seeds-and-superfoods' } })

  const brandShuddho = await prisma.brand.findUnique({ where: { slug: 'shuddho-farm-fresh' } })
  const brandSundarban = await prisma.brand.findUnique({ where: { slug: 'sundarban-native' } })
  const brandBorno = await prisma.brand.findUnique({ where: { slug: 'borno-organics' } })
  const brandArabian = await prisma.brand.findUnique({ where: { slug: 'arabian-palms' } })

  const sampleProducts = [
    {
      name: 'Raw Sundarban Wild Honey (সুন্দরবনের প্রাকৃতিক মধু)',
      slug: 'raw-sundarban-wild-honey-500g',
      sku: 'SB-HNY-001',
      categoryId: catHoney?.id,
      brandId: brandSundarban?.id,
      shortDesc: '100% Raw, unfiltered honey gathered directly from Sundarban mangrove deep forests.',
      description: 'Sundarban Raw Honey is collected directly by traditional honey-hunters (Mawals) from the deep mangrove forest. Free from heating, pasteurization, or added sugars. Naturally rich in enzymes, pollen, and antioxidants.',
      thumbnail: 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?auto=format&fit=crop&w=600&q=80',
      regularPrice: 850,
      salePrice: 750,
      stock: 45,
      unit: '500g Glass Jar',
      isFeatured: true,
      isBestSelling: true,
      isTrending: true,
      isNewArrival: false,
      isOffer: true,
      isOrganic: true,
      isFreeDelivery: false,
      isPublished: true,
      avgRating: 4.9,
      reviewCount: 38,
      soldCount: 142,
      variants: [
        { name: '500g Jar', price: 850, salePrice: 750, stock: 30, isDefault: true },
        { name: '1000g (1kg) Jar', price: 1600, salePrice: 1400, stock: 15, isDefault: false },
      ]
    },
    {
      name: 'Traditional Ghani Cold-Pressed Mustard Oil (ঘানি ভাঙা সরিষার তেল)',
      slug: 'ghani-cold-pressed-mustard-oil-1l',
      sku: 'SB-OIL-001',
      categoryId: catOil?.id,
      brandId: brandBorno?.id,
      shortDesc: 'Pure wooden-pressed pungent mustard oil from local desi mustard seeds.',
      description: 'Extracted using traditional wooden Ghani at slow speed and low temperature to retain full pungency (ঝাঁঝ), aroma, and essential fatty acids. Ideal for authentic Bangladeshi bhortas, curries, and pickles.',
      thumbnail: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&w=600&q=80',
      regularPrice: 380,
      salePrice: 340,
      stock: 60,
      unit: '1 Litre Bottle',
      isFeatured: true,
      isBestSelling: true,
      isTrending: true,
      isNewArrival: false,
      isOffer: false,
      isOrganic: true,
      isFreeDelivery: false,
      isPublished: true,
      avgRating: 4.8,
      reviewCount: 29,
      soldCount: 210,
      variants: [
        { name: '1 Litre Bottle', price: 380, salePrice: 340, stock: 40, isDefault: true },
        { name: '2 Litre Can', price: 740, salePrice: 650, stock: 20, isDefault: false },
      ]
    },
    {
      name: 'Pabna Desi Cow Pure Ghee (পাবনার খাঁটি গাওয়া ঘি)',
      slug: 'pabna-desi-cow-pure-ghee-500g',
      sku: 'SB-GHE-001',
      categoryId: catGhee?.id,
      brandId: brandShuddho?.id,
      shortDesc: 'Aromatic granular butter ghee prepared from village grass-fed cow milk.',
      description: 'Traditional Pabna style pure cow milk ghee prepared through slow churning of fresh cream. Rich golden color, heavenly aroma, and authentic granular (দানাদার) texture.',
      thumbnail: 'https://images.unsplash.com/photo-1628088062854-d1870b4553da?auto=format&fit=crop&w=600&q=80',
      regularPrice: 1100,
      salePrice: 950,
      stock: 35,
      unit: '500g Jar',
      isFeatured: true,
      isBestSelling: true,
      isTrending: false,
      isNewArrival: false,
      isOffer: true,
      isOrganic: true,
      isFreeDelivery: true,
      isPublished: true,
      avgRating: 5.0,
      reviewCount: 45,
      soldCount: 98,
      variants: [
        { name: '500g Jar', price: 1100, salePrice: 950, stock: 20, isDefault: true },
        { name: '1000g (1kg) Jar', price: 2100, salePrice: 1850, stock: 15, isDefault: false },
      ]
    },
    {
      name: 'Ajwa Dates of Al-Madinah (মদিনার প্রিমিয়াম আজওয়া খেজুর)',
      slug: 'ajwa-dates-al-madinah-500g',
      sku: 'SB-DAT-001',
      categoryId: catNuts?.id,
      brandId: brandArabian?.id,
      shortDesc: 'Authentic VIP grade soft & chewy Ajwa dates imported directly from Saudi Arabia.',
      description: 'Directly imported VIP grade Ajwa dates from Madinah Munawwarah. Naturally sweet, high in dietary fiber, iron, and potassium. Preserved in hygienic food-grade air-tight packaging.',
      thumbnail: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&w=600&q=80',
      regularPrice: 950,
      salePrice: 820,
      stock: 50,
      unit: '500g Box',
      isFeatured: true,
      isBestSelling: true,
      isTrending: true,
      isNewArrival: false,
      isFlashSale: true,
      isOrganic: true,
      isFreeDelivery: false,
      isPublished: true,
      avgRating: 4.9,
      reviewCount: 52,
      soldCount: 180,
      variants: [
        { name: '500g Box', price: 950, salePrice: 820, stock: 35, isDefault: true },
        { name: '1000g (1kg) Box', price: 1800, salePrice: 1580, stock: 15, isDefault: false },
      ]
    },
    {
      name: 'Organic Superfood Chia Seeds (অর্গানিক চিয়া সিড)',
      slug: 'organic-superfood-chia-seeds-250g',
      sku: 'SB-SED-001',
      categoryId: catSeeds?.id,
      brandId: brandShuddho?.id,
      shortDesc: 'Certified organic black chia seeds rich in Omega-3, fiber, and plant protein.',
      description: 'High-purity raw organic chia seeds. Excellent source of Omega-3 fatty acids, calcium, and dietary fiber. Ideal for morning detox water, smoothies, oat bowls, and puddings.',
      thumbnail: 'https://images.unsplash.com/photo-1508746829417-e6f548d8d6ed?auto=format&fit=crop&w=600&q=80',
      regularPrice: 420,
      salePrice: 350,
      stock: 75,
      unit: '250g Pouch',
      isFeatured: false,
      isBestSelling: true,
      isTrending: true,
      isNewArrival: true,
      isFlashSale: true,
      isOrganic: true,
      isFreeDelivery: false,
      isPublished: true,
      avgRating: 4.7,
      reviewCount: 22,
      soldCount: 88,
      variants: [
        { name: '250g Pouch', price: 420, salePrice: 350, stock: 45, isDefault: true },
        { name: '500g Pouch', price: 780, salePrice: 650, stock: 30, isDefault: false },
      ]
    },
    {
      name: 'Kashmiri Organic Mongra Saffron (কাশ্মীরি জাফরান / কেশর)',
      slug: 'kashmiri-organic-mongra-saffron-1g',
      sku: 'SB-SPC-001',
      categoryId: catSpices?.id,
      brandId: brandShuddho?.id,
      shortDesc: 'Grade 1 pure Kashmiri red saffron strands with intense natural aroma.',
      description: '100% Pure certified Kashmiri Mongra Saffron with full deep-red stigmata. Provides radiant golden hue and royal aroma to biryani, kheer, saffron milk, and skincare.',
      thumbnail: 'https://images.unsplash.com/photo-1596040033282-be29f79efbb9?auto=format&fit=crop&w=600&q=80',
      regularPrice: 450,
      salePrice: 390,
      stock: 30,
      unit: '1 Gram Acrylic Box',
      isFeatured: true,
      isBestSelling: false,
      isTrending: true,
      isNewArrival: true,
      isOffer: true,
      isOrganic: true,
      isFreeDelivery: true,
      isPublished: true,
      avgRating: 5.0,
      reviewCount: 16,
      soldCount: 42,
    },
    {
      name: 'Cold-Pressed Black Seed (Kalojeera) Oil (কালোজিরা তেল)',
      slug: 'cold-pressed-black-seed-kalojeera-oil-100ml',
      sku: 'SB-OIL-002',
      categoryId: catOil?.id,
      brandId: brandBorno?.id,
      shortDesc: '100% Virgin cold-pressed black seed oil for immunity and wellness.',
      description: 'Cold pressed from selected high-grade Nigella Sativa (Kalojeera) seeds. Unfiltered and unrefined to preserve active thymoquinone and health-boosting antioxidants.',
      thumbnail: 'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?auto=format&fit=crop&w=600&q=80',
      regularPrice: 320,
      salePrice: 280,
      stock: 40,
      unit: '100ml Bottle',
      isFeatured: false,
      isBestSelling: true,
      isTrending: true,
      isNewArrival: false,
      isOffer: false,
      isOrganic: true,
      isPublished: true,
      avgRating: 4.8,
      reviewCount: 19,
      soldCount: 65,
    },
    {
      name: 'Premium California Jumbo Almonds (কাঠবাদাম)',
      slug: 'premium-california-jumbo-almonds-500g',
      sku: 'SB-NUT-001',
      categoryId: catNuts?.id,
      brandId: brandArabian?.id,
      shortDesc: 'Crunchy, sweet and unroasted premium grade California whole almonds.',
      description: 'Fresh season natural California almonds with uniform jumbo size and high oil content. Rich in vitamin E, magnesium, and healthy dietary fiber.',
      thumbnail: 'https://images.unsplash.com/photo-1508061253366-f7da158b6d46?auto=format&fit=crop&w=600&q=80',
      regularPrice: 620,
      salePrice: 540,
      stock: 55,
      unit: '500g Pack',
      isFeatured: false,
      isBestSelling: false,
      isTrending: true,
      isNewArrival: true,
      isOrganic: true,
      isPublished: true,
      avgRating: 4.9,
      reviewCount: 14,
      soldCount: 50,
    },
    {
      name: 'Hill Tracts Stone-Ground Turmeric Powder (হলুদ গুঁড়া)',
      slug: 'hill-tracts-stone-ground-turmeric-powder-250g',
      sku: 'SB-SPC-002',
      categoryId: catSpices?.id,
      brandId: brandShuddho?.id,
      shortDesc: 'Sun-dried natural turmeric from Khagrachhari hills with high curcumin.',
      description: 'Grown naturally in the fertile hill tracts of Chittagong without chemical fertilizers. Sun-dried and slow stone-milled to preserve high curcumin levels and natural medicinal benefits.',
      thumbnail: 'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?auto=format&fit=crop&w=600&q=80',
      regularPrice: 190,
      salePrice: 160,
      stock: 80,
      unit: '250g Jar',
      isFeatured: false,
      isBestSelling: false,
      isTrending: false,
      isNewArrival: true,
      isOrganic: true,
      isPublished: true,
      avgRating: 4.7,
      reviewCount: 9,
      soldCount: 35,
    }
  ]

  for (const prod of sampleProducts) {
    const { variants, ...prodData } = prod
    const createdProduct = await prisma.product.upsert({
      where: { slug: prodData.slug },
      update: prodData,
      create: {
        ...prodData,
        images: {
          create: [
            { url: prodData.thumbnail, sortOrder: 0, alt: prodData.name }
          ]
        },
        variants: variants ? {
          create: variants
        } : undefined
      }
    })

    // Upsert inventory
    await prisma.inventory.upsert({
      where: { productId: createdProduct.id },
      update: { quantity: prodData.stock },
      create: { productId: createdProduct.id, quantity: prodData.stock }
    })
  }

  // 4. Hero Banners
  const heroBanners = [
    {
      title: '100% Pure Organic Living',
      heading: 'Pure & Natural Grocery Directly From Farmers',
      subheading: 'Enjoy genuine taste, zero chemicals & guaranteed freshness across Bangladesh.',
      buttonText: 'Shop Organic Now',
      buttonUrl: '/shop',
      image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=1600&q=80',
      type: 'HERO' as const,
      sortOrder: 1,
      isActive: true,
    },
    {
      title: 'Sundarban Raw Wild Honey',
      heading: 'Harvested Directly From Deep Mangroves',
      subheading: 'Lab tested pure honey with natural enzymes, vitamins & immune support.',
      buttonText: 'Order Honey',
      buttonUrl: '/shop?category=pure-honey',
      image: 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?auto=format&fit=crop&w=1600&q=80',
      type: 'HERO' as const,
      sortOrder: 2,
      isActive: true,
    }
  ]

  for (const b of heroBanners) {
    const existing = await prisma.banner.findFirst({ where: { title: b.title } })
    if (!existing) {
      await prisma.banner.create({ data: b })
    }
  }

  // 5. Active Flash Sale
  const flashSale = await prisma.flashSale.upsert({
    where: { id: 'flash-sale-live' },
    update: {},
    create: {
      id: 'flash-sale-live',
      name: 'Weekend Organic Mega Flash Sale 🔥',
      startTime: new Date(),
      endTime: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days ahead
      isActive: true,
    }
  })

  // 6. Active Promo Coupons
  const coupons = [
    {
      code: 'SHUDDHO10',
      type: 'PERCENTAGE' as const,
      value: 10,
      minOrder: 800,
      maxDiscount: 200,
      isActive: true,
    },
    {
      code: 'FREESHIP',
      type: 'FREE_DELIVERY' as const,
      value: 0,
      minOrder: 999,
      isActive: true,
    },
    {
      code: 'WELCOME50',
      type: 'FIXED' as const,
      value: 50,
      minOrder: 500,
      isActive: true,
      isFirstOrder: true,
    }
  ]

  for (const c of coupons) {
    await prisma.coupon.upsert({
      where: { code: c.code },
      update: c,
      create: c,
    })
  }

  console.log('🎉 Sample organic products, hero banners, flash sale, and coupons ready!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
