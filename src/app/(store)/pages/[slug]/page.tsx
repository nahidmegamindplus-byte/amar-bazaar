import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'

export default async function CMSPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params

  const page = await prisma.page.findFirst({
    where: { slug, isPublished: true },
  })

  if (!page) {
    notFound()
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
