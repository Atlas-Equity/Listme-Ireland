declare global {
  var __dnsOptimizerInitialized: boolean | undefined;
  var __dnsIpCache: Map<string, { ip: string; expiresAt: number }> | undefined;
}

export function initDnsOptimizer() {
  if (typeof window !== 'undefined') return;
  if (typeof process === 'undefined' || process.env.NEXT_RUNTIME === 'edge') return;
  if (globalThis.__dnsOptimizerInitialized) return;
  globalThis.__dnsOptimizerInitialized = true;

  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const dns = require('node:dns');
    try {
      dns.setDefaultResultOrder('ipv4first');
    } catch {}

    const ipCache = globalThis.__dnsIpCache ?? new Map<string, { ip: string; expiresAt: number }>();
    globalThis.__dnsIpCache = ipCache;

    const originalLookup = dns.lookup;

    dns.lookup = function (hostname: any, options: any, callback: any) {
      if (typeof options === 'function') {
        callback = options;
        options = {};
      }

      if (
        !hostname ||
        typeof hostname !== 'string' ||
        hostname === 'localhost' ||
        hostname === '127.0.0.1' ||
        hostname === '::1' ||
        hostname.endsWith('.local')
      ) {
        return (originalLookup as any).call(dns, hostname, options, callback);
      }

      const cached = ipCache.get(hostname);
      if (cached && Date.now() < cached.expiresAt) {
        if (options && options.all) {
          return callback(null, [{ address: cached.ip, family: 4 }]);
        }
        return callback(null, cached.ip, 4);
      }

      dns.resolve4(hostname, (err: any, addresses: string[]) => {
        if (!err && addresses && addresses.length > 0) {
          const ip = addresses[0];
          ipCache.set(hostname, { ip, expiresAt: Date.now() + 5 * 60 * 1000 });
          if (options && options.all) {
            return callback(null, [{ address: ip, family: 4 }]);
          }
          return callback(null, ip, 4);
        }

        const fallbackOpts = typeof options === 'object' && options !== null ? { ...options, family: 4 } : { family: 4 };
        return (originalLookup as any).call(dns, hostname, fallbackOpts, callback);
      });
    };
  } catch {
  }
}

initDnsOptimizer();
