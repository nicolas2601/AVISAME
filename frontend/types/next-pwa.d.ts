declare module 'next-pwa' {
  import type { NextConfig } from 'next';

  interface NextPwaOptions {
    dest?: string;
    disable?: boolean;
    register?: boolean;
    skipWaiting?: boolean;
    buildExcludes?: Array<string | RegExp>;
    runtimeCaching?: unknown;
    [key: string]: unknown;
  }

  type NextConfigFactory = (nextConfig?: NextConfig) => NextConfig;

  function withPWAInit(options?: NextPwaOptions): NextConfigFactory;

  export type { NextPwaOptions };
  export default withPWAInit;
}
