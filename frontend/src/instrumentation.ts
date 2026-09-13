import '@/utils/dnsOptimizer';

export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    const { initDnsOptimizer } = await import('@/utils/dnsOptimizer');
    initDnsOptimizer();
  }
}

