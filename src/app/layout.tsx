import type { Metadata } from 'next'
import './globals.css'
import { Toaster } from 'react-hot-toast'
import { getBrandingSettings } from '@/lib/settings'

export async function generateMetadata(): Promise<Metadata> {
  const branding = await getBrandingSettings()
  return {
    title: {
      default: branding.siteName + ' - ' + branding.tagline,
      template: `%s | ${branding.siteName}`,
    },
    description: 'Premium organic grocery, honey, spices, and natural foods delivered across Bangladesh.',
    keywords: 'organic grocery bangladesh, pure honey, mustard oil, dates, spices, natural food',
    authors: [{ name: branding.siteName }],
    creator: branding.siteName,
    metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'),
    openGraph: {
      type: 'website',
      locale: 'en_BD',
      siteName: branding.siteName,
    },
    robots: {
      index: true,
      follow: true,
    },
  }
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=Hind+Siliguri:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        {children}
        <Toaster
          position="top-right"
          toastOptions={{
            className: 'toast-container',
            duration: 3000,
            style: {
              background: '#1e293b',
              color: '#f8fafc',
              borderRadius: '0.75rem',
              padding: '0.75rem 1rem',
              fontSize: '0.875rem',
            },
            success: {
              iconTheme: { primary: '#16a34a', secondary: '#fff' },
            },
            error: {
              iconTheme: { primary: '#ef4444', secondary: '#fff' },
            },
          }}
        />
      </body>
    </html>
  )
}
