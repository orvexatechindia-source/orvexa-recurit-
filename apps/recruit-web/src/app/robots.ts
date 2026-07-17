import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/admin/', '/pipeline/', '/settings/'],
    },
    sitemap: 'https://orvexarecruit.com/sitemap.xml',
  };
}
