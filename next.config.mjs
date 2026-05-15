/** @type {import('next').NextConfig} */
const nextConfig = {
  /* config options here */
};

if (process.env.NODE_ENV === 'development') {
  nextConfig.allowedDevOrigins = ['192.168.0.104', '192.168.0.102', 'localhost', '127.0.0.1'];
}

export default nextConfig;
