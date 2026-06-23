const { i18n } = require('./next-i18next.config');

const basePath = (process.env.NEXT_PUBLIC_DESKTOP_BASE_PATH || '').trim().replace(/\/$/, '');

/** @type {import('next').NextConfig} */
const nextConfig = {
  i18n,
  devIndicators: false,
  reactStrictMode: true,
  transpilePackages: ['rpc', 'result', 'osdc-content'],
  basePath: basePath || undefined,
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
}

module.exports = nextConfig
