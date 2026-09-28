import type { Metadata } from 'next'
import { MenuPage } from '@/components/menu-page'
import { BASE_PATH, asset } from '@/lib/site'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'

export const metadata: Metadata = {
  title: 'Menu',
  description: 'Browse the JACKX menu — breakfast, sandwiches and drinks, made to be shared by the Nile in Damietta.',
  alternates: { canonical: new URL(`${BASE_PATH}/menu/`, SITE_URL).toString() },
  openGraph: {
    title: 'Menu — JACKX',
    description: 'Breakfast, sandwiches and drinks at JACKX, Damietta.',
    url: new URL(`${BASE_PATH}/menu/`, SITE_URL).toString(),
    images: [{ url: asset('/og-image.jpg'), width: 1200, height: 630, alt: 'JACKX — Flavors Evoke Memories' }],
  },
}

export default function Page() {
  return <MenuPage />
}
