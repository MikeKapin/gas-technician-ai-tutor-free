import type { Metadata, Viewport } from 'next'
import './globals.css'
import { SubscriptionProvider } from '@/contexts/SubscriptionContext'

export const metadata: Metadata = {
  title: 'Gas-Tech Tutor - Canadian Gas Technician AI Tutor Pro | G3 G2 Certification',
  description: 'Gas-Tech Tutor: Professional AI-powered tutor for Canadian Gas Technician certification. CSA B149.1-25 & B149.2-25 compliant training for G3 and G2 gas technicians.',
  keywords: [
    'Canadian Gas Technician',
    'G3 Certification',
    'G2 Certification',
    'CSA B149.1-25',
    'CSA B149.2-25',
    'Gas Technician Training',
    'LARK Labs',
    'AI Tutor',
    'Professional Training'
  ],
  authors: [{ name: 'LARK Labs' }],
  creator: 'LARK Labs',
  robots: 'index, follow',
  manifest: '/manifest.json',
  icons: {
    icon: [
      { url: '/icon-96x96.png', sizes: '96x96', type: 'image/png' },
      { url: '/icon-192x192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icon-512x512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: [
      { url: '/icon-152x152.png', sizes: '152x152', type: 'image/png' },
      { url: '/icon-192x192.png', sizes: '192x192', type: 'image/png' },
    ],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Gas-Tech Tutor',
  },
  openGraph: {
    title: 'Gas-Tech Tutor - Canadian Gas Technician AI Tutor Pro | G3 G2 Certification',
    description: 'Gas-Tech Tutor: Professional AI-powered tutor for Canadian Gas Technician certification. CSA B149.1-25 & B149.2-25 compliant training.',
    type: 'website',
    locale: 'en_CA',
    images: ['/icon-512x512.png'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Gas-Tech Tutor - Canadian Gas Technician AI Tutor Pro | G3 G2 Certification',
    description: 'Gas-Tech Tutor: Professional AI-powered tutor for Canadian Gas Technician certification. CSA B149.1-25 & B149.2-25 compliant training.',
    images: ['/icon-512x512.png'],
  }
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#0f172a',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js')
                    .then(function(registration) {
                      console.log('SW registered: ', registration);
                    })
                    .catch(function(registrationError) {
                      console.log('SW registration failed: ', registrationError);
                    });
                });
              }
            `,
          }}
        />
      </head>
      <body className="font-sans antialiased">
        <SubscriptionProvider>
          <main className="min-h-screen">
            {children}
          </main>
        </SubscriptionProvider>
      </body>
    </html>
  )
}