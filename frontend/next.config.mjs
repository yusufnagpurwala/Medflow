/** @type {import('next').NextConfig} */
const nextConfig = {
  /* config options here */
  transpilePackages: [
    '@mui/x-data-grid',
  ],
  reactCompiler: true,
  reactStrictMode: true,
};

export default nextConfig;
