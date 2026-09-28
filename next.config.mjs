/** Allow dev server cross-origin requests for HMR and chunk resources.
 *  Matches localhost, 127.0.0.1, and 192.168.x.x local network IPs. */
const allowedDevOrigins = ['localhost', '127.0.0.1', '192.168.1.2']

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Allow dev server cross-origin requests for HMR and chunk resources.
  allowedDevOrigins: allowedDevOrigins,
  // Output to static `out/` directory for Vercel deployment.
  output: 'export',
  // Vercel automatically injects environment variables; no basePath needed.
  trailingSlash: true,
  reactStrictMode: true,
  poweredByHeader: false,
  productionBrowserSourceMaps: false,
  compress: true,
  skipTrailingSlashRedirect: true,
  env: {
    NEXT_PUBLIC_BASE_PATH: '',
  },
  experimental: {
    // Tree-shake lucide icons instead of pulling the whole icon set.
    optimizePackageImports: ['lucide-react'],
  },
}

export default nextConfig