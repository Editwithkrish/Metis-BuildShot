import React from "react"
import type { Metadata, Viewport } from 'next'
import Script from 'next/script'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'
import { LanguageProvider } from "@/lib/i18n-context"

export const metadata: Metadata = {
  title: 'METIS - Motherhood & Newborn Care Intelligence Platform',
  description: 'AI-powered nutrition and health monitoring for maternal and newborn care. Early malnutrition detection, personalized guidance, and continuous support.',
  applicationName: 'METIS',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'METIS',
  },
  icons: {
    icon: [
      { url: '/icons/metis-192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icons/metis-512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: [{ url: '/icons/metis-192.png', sizes: '192x192', type: 'image/png' }],
  },
  formatDetection: {
    telephone: false,
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: '#86efac',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" data-scroll-behavior="smooth">
      <head>
        <meta name="mobile-web-app-capable" content="yes" />
      </head>
      <body className="font-sans antialiased">
        <LanguageProvider>
          {children}
        </LanguageProvider>
        <Analytics />
        {process.env.NODE_ENV === "production" ? (
          <Script id="service-worker-registration" strategy="afterInteractive">
            {`
              if ('serviceWorker' in navigator) {
                var registerMetisWorker = function () {
                  navigator.serviceWorker.register('/sw.js', { scope: '/' }).then(function (registration) {
                    registration.update();
                  }).catch(function (error) {
                    console.warn('METIS offline support could not start:', error);
                  });
                };
                if (document.readyState === 'complete') registerMetisWorker();
                else window.addEventListener('load', registerMetisWorker, { once: true });
              }
            `}
          </Script>
        ) : (
          <Script id="service-worker-development-cleanup" strategy="afterInteractive">
            {`
              if ('serviceWorker' in navigator) {
                navigator.serviceWorker.getRegistrations().then(function (registrations) {
                  registrations.forEach(function (registration) { registration.unregister(); });
                });
              }
              if ('caches' in window) {
                caches.keys().then(function (keys) {
                  keys.filter(function (key) { return key.indexOf('metis-') === 0; })
                    .forEach(function (key) { caches.delete(key); });
                });
              }
            `}
          </Script>
        )}
      </body>
    </html>
  )
}
