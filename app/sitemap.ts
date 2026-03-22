import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: 'https://www.soviron.tech', lastModified: new Date(), changeFrequency: 'weekly', priority: 1 },
    { url: 'https://www.soviron.tech/login', lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
    { url: 'https://www.soviron.tech/signup', lastModified: new Date(), changeFrequency: 'monthly', priority: 0.8 },
    { url: 'https://www.soviron.tech/pricing', lastModified: new Date(), changeFrequency: 'monthly', priority: 0.8 },
    { url: 'https://www.soviron.tech/privacy', lastModified: new Date(), changeFrequency: 'yearly', priority: 0.3 },
    { url: 'https://www.soviron.tech/terms', lastModified: new Date(), changeFrequency: 'yearly', priority: 0.3 },
  ];
}
