import type { MetadataRoute } from 'next'
import { BASE_PATH } from '@/lib/site'

export const dynamic = 'force-static'

export default function robots(): MetadataRoute.Robots {
  // Use NEXT_PUBLIC_SITE_URL for production; required for Vercel deployment.
  // Set this as a Vercel Environment Variable (e.g., https://jackx.vercel.app).
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://jackx-website.vercel.app'
  return {
    rules: { userAgent: '*', allow: '/' },
    sitemap: `${siteUrl}${BASE_PATH}/sitemap.xml`,
  }
}