import type { MetadataRoute } from 'next'
import { BASE_PATH } from '@/lib/site'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'

export const dynamic = 'force-static'

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date()
  const lastModified = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  return [
    { url: `${SITE_URL}${BASE_PATH}/`, lastModified, changeFrequency: 'monthly', priority: 1 },
    { url: `${SITE_URL}${BASE_PATH}/menu/`, lastModified, changeFrequency: 'monthly', priority: 0.8 },
  ]
}
