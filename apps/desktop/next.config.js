const { i18n } = require('./next-i18next.config');

const basePath = (process.env.NEXT_PUBLIC_DESKTOP_BASE_PATH || '').trim().replace(/\/$/, '');
const isStaticExport = process.env.STATIC_EXPORT === '1' || process.env.STATIC_EXPORT === 'true';

/** @type {import('next').NextConfig} */
const nextConfig = {
  ...(isStaticExport ? {} : { i18n }),
  devIndicators: false,
  reactStrictMode: true,
  transpilePackages: ['rpc', 'result', 'osdc-content'],
  output: isStaticExport ? 'export' : undefined,
  trailingSlash: isStaticExport,
  images: isStaticExport ? { unoptimized: true } : undefined,
  basePath: basePath || undefined,
  assetPrefix: isStaticExport && basePath ? `${basePath}/` : undefined,
  ...(isStaticExport ? {} : {
    async headers() {
      return [
        {
          source: "/",
          headers: [
            { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
            { key: "Cross-Origin-Embedder-Policy", value: "require-corp" },
            { key: "Access-Control-Allow-Credentials", value: "true" },
            { key: "Access-Control-Allow-Origin", value: "*" },
            { key: "Access-Control-Allow-Methods", value: "GET,OPTIONS,PATCH,DELETE,POST,PUT" },
            { key: "Access-Control-Allow-Headers", value: "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version" },
          ]
        }
      ]
    }
  })
}

module.exports = nextConfig
