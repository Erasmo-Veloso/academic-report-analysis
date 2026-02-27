/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  // Allow dev server to be accessed from different origins (for mobile testing, VMs, etc.)
  allowedDevOrigins: [
    'localhost',
    '127.0.0.1',
    '192.168.56.2',
    '192.168.1.0/24', // Allow entire local network range
  ],
}

export default nextConfig
