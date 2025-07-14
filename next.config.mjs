/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  reactStrictMode: true,
  
  // Optimizations for Azure Static Web Apps
  trailingSlash: true,  // Ensures consistent routing
  images: {
    unoptimized: true,  // Required for static export
  },
  
  // Performance optimizations
  experimental: {
    optimizeCss: true,
  },
  
  // Production optimizations
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
  
  // Azure Static Web Apps specific
  assetPrefix: process.env.NODE_ENV === 'production' ? undefined : '',
}

export default nextConfig
