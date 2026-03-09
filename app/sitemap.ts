import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: 'https://soviron.tech', lastModified: new Date(), changeFrequency: 'weekly', priority: 1 },
    { url: 'https://soviron.tech/login', lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
    { url: 'https://soviron.tech/signup', lastModified: new Date(), changeFrequency: 'monthly', priority: 0.8 },
    { url: 'https://soviron.tech/pricing', lastModified: new Date(), changeFrequency: 'monthly', priority: 0.8 },
    { url: 'https://soviron.tech/privacy', lastModified: new Date(), changeFrequency: 'yearly', priority: 0.3 },
    { url: 'https://soviron.tech/terms', lastModified: new Date(), changeFrequency: 'yearly', priority: 0.3 },
  ];
}
