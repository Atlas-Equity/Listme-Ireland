export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    try {
      const dns = await import('node:dns');
      dns.setDefaultResultOrder('ipv4first');
    } catch (e) {
      // Ignore if unavailable
    }
  }
}
