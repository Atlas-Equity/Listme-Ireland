import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.listme.ie';

  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: [
        '/my-listme',
        '/settings',
        '/api/',
        '/auth/',
        '/stripe-setup',
        '/wallet-setup',
        '/messages',
        '/messages/',
        '/payment-success',
        '/leave-review/',
      ],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
