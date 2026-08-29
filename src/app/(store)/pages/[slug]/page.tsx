import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function CMSPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params

  let page: any = null

  try {
    page = await prisma.page.findFirst({
      where: { slug, isPublished: true },
    })
  } catch {
    // DB fallback
  }

  if (!page) {
    // Basic fallback pages
    if (slug === 'about-us') {
      page = { title: 'About Us', content: '<p>ShuddhoBazar is Bangladesh\'s premium online grocery store specializing in pure organic products.</p>' }
    } else if (slug === 'contact-us') {
      page = { title: 'Contact Us', content: '<p>Email: support@shuddhobazar.com<br/>Phone: +880-1234-567890</p>' }
    } else if (slug === 'faq') {
      page = { title: 'Frequently Asked Questions', content: '<p>We deliver nationwide across all 64 districts in Bangladesh with Cash on Delivery and Mobile banking.</p>' }
    } else {
      notFound()
    }
  }

  return (
    <div className="container py-12 max-w-3xl mx-auto space-y-6">
      <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 border-b border-slate-200 pb-4">
        {page.title}
      </h1>

      <div
        className="prose prose-slate max-w-none text-slate-600 text-sm md:text-base leading-relaxed space-y-4"
        dangerouslySetInnerHTML={{ __html: page.content }}
      />
    </div>
  )
}
