import type { Metadata, Viewport } from 'next'
import localFont from 'next/font/local'
import { BASE_PATH, asset } from '@/lib/site'
import './globals.css'

/**
 * One variable font (Latin, 400–900) carries the whole identity. It is
 * self-hosted, preloaded, and served with a content hash, so it is immune to
 * third-party downtime and correct under any deployment base path.
 *
 * `adjustFontFallback` makes Next derive a metric-matched local fallback, so the
 * swap from system font to Archivo shifts nothing (CLS stays at 0).
 */
const archivo = localFont({
  src: './fonts/archivo-latin-var.woff2',
  weight: '400 900',
  style: 'normal',
  display: 'swap',
  preload: true,
  variable: '--font-archivo',
  fallback: ['Arial', 'Helvetica', 'sans-serif'],
  adjustFontFallback: 'Arial',
})

/**
 * Absolute origin used for canonical/OG URLs. The deploy workflow injects the real
 * GitHub Pages URL; the localhost default keeps local builds working.
 */
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'
const url = (path: string) => new URL(`${BASE_PATH}${path}`, SITE_URL).toString()

const TITLE = 'JACKX — Flavors Evoke Memories'
const DESCRIPTION =
  'JACKX is a coffee shop on the Nile Corniche in Damietta. Coffee, food and the moments that stay with you. Explore the menu and find us next to First Abu Dhabi Bank.'

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: TITLE,
    template: '%s — JACKX',
  },
  description: DESCRIPTION,
  applicationName: 'JACKX',
  keywords: ['JACKX', 'چاكس', 'coffee shop Damietta', 'café Damietta', 'Nile Corniche', 'Egypt coffee shop'],
  authors: [{ name: 'JACKX' }],
  alternates: { canonical: url('/') },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    siteName: 'JACKX',
    title: TITLE,
    description: DESCRIPTION,
    url: url('/'),
    images: [{ url: asset('/og-image.jpg'), width: 1200, height: 630, alt: TITLE }],
  },
  twitter: {
    card: 'summary_large_image',
    title: TITLE,
    description: DESCRIPTION,
    images: [asset('/og-image.jpg')],
  },
  icons: {
    icon: [
      { url: asset('/favicon-32.png'), sizes: '32x32', type: 'image/png' },
      { url: asset('/icon.svg'), type: 'image/svg+xml' },
    ],
    apple: [{ url: asset('/apple-icon.png'), sizes: '180x180' }],
  },
  robots: { index: true, follow: true },
  formatDetection: { telephone: false },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  // The design is a fixed light theme; declare it so form controls and scrollbars match.
  colorScheme: 'light',
  themeColor: '#f5f1eb',
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${archivo.variable} js`}>
      <head>
        {/* Tags the document as script-capable before first paint so scroll-reveal
            styling is only ever applied while something can undo it. The timeout is
            a safety net: if /site.js were ever to fail, content still becomes
            visible rather than staying permanently invisible. */}
        <script
          dangerouslySetInnerHTML={{
            __html:
              'setTimeout(function(){if(!window.jackx)document.documentElement.classList.add("reveal-fallback")},2500)',
          }}
        />
      </head>
      <body>
        {children}
        <script src={asset('/site.js')} defer />
      </body>
    </html>
  )
}
