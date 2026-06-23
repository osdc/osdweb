const { config } = require('process')

const desktopProxyUrl = (process.env.DESKTOP_PROXY_URL || 'http://localhost:3001').replace(/\/$/, '');
const desktopProxyBasePath = (process.env.DESKTOP_PROXY_BASE_PATH || '/desktop').replace(/\/$/, '');

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['rpc', 'result', 'osdc-content'],
  devIndicators: false,
  turbopack: {
    rules: {
      "*.frag": {
        loaders: ['raw-loader'],
        as: "*.js"
      },
      "*.vert": {
        loaders: ['raw-loader'],
        as: "*.js"
      }
    }
  },
  async headers() {
    return [
      {
        source: "/",
        headers: [
          { key: "Access-Control-Allow-Credentials", value: "true" },
          { key: "Access-Control-Allow-Origin", value: "*" },
          { key: "Access-Control-Allow-Methods", value: "GET,OPTIONS,PATCH,DELETE,POST,PUT" },
          { key: "Access-Control-Allow-Headers", value: "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version" },
        ]
      }
    ]
  },
  async rewrites() {
    return [
      {
        source: '/desktop',
        destination: `${desktopProxyUrl}${desktopProxyBasePath}`,
      },
      {
        source: '/desktop/:path*',
        destination: `${desktopProxyUrl}${desktopProxyBasePath}/:path*`,
      },
    ];
  }
}

module.exports = nextConfig
