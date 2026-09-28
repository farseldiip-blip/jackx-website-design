import type { MetadataRoute } from 'next'
import { BASE_PATH } from '@/lib/site'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'

export const dynamic = 'force-static'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: '*', allow: '/' },
    sitemap: `${SITE_URL}${BASE_PATH}/sitemap.xml`,
  }
}
