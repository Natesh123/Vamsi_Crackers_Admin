import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://vamsicrackers.in';

  // In a real application, you might fetch product categories or individual products here
  // and map them to sitemap entries. For now, we will include the main static routes.

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1,
    }
  ];
}
