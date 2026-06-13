import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));

/** @type {import('next').NextConfig} */
const nextConfig = {
  /* config options here */
  transpilePackages: [
    '@mui/x-data-grid',
  ],
  reactCompiler: true,
  reactStrictMode: true,
  // Pin the workspace root so Next doesn't pick a stray parent lockfile.
  turbopack: {
    root: __dirname,
  },
};

export default nextConfig;
