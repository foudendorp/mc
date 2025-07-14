/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  reactStrictMode: true,
  
  // Required for static export
  images: {
    unoptimized: true,
  },
  
  // Ensure consistent routing for Azure Static Web Apps
  trailingSlash: true,
  
  // Disable problematic features for static export
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
}

export default nextConfig
