import type { MetadataRoute } from 'next'
import { BASE_PATH } from '@/lib/site'

export const dynamic = 'force-static'

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date()
  const lastModified = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  // Use NEXT_PUBLIC_SITE_URL for production; required for Vercel deployment.
  // Set this as a Vercel Environment Variable (e.g., https://jackx.vercel.app).
  // Defaulting to localhost would fail the postbuild verification.
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://jackx-website.vercel.app'
  return [
    { url: `${siteUrl}${BASE_PATH}/`, lastModified, changeFrequency: 'monthly', priority: 1 },
    { url: `${siteUrl}${BASE_PATH}/menu/`, lastModified, changeFrequency: 'monthly', priority: 0.8 },
  ]
}