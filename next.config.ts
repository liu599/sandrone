import type { NextConfig } from "next";
import { setGlobalDispatcher, ProxyAgent } from 'undici';

// 检查是否为开发环境
if (process.env.NODE_ENV === 'development') {
  try {
    const proxyAgent = new ProxyAgent('http://127.0.0.1:10811');
    setGlobalDispatcher(proxyAgent);
    console.log('\x1b[32m%s\x1b[0m', '🛡️ [Proxy] 已连接到本地代理 http://127.0.0.1:10811');
  } catch (e) {
    console.error('❌ [Proxy] 代理设置失败:', e);
  }
}


const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: '/proxyUrl/:path*',
        destination: 'http://127.0.0.1:8989/:path*',
      },
    ]
  },
  experimental: {
    proxyTimeout: 300000, // 5 minutes
  }
};

export default nextConfig;
