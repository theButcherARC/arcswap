import type { MetadataRoute } from 'next';
import { SITE_URL } from '@/lib/site';

// Only public content pages. App routes (/dashboard, /bulk-pay, /admin)
// are noindexed via their own layouts and stay out of the sitemap.
const CONTENT_ROUTES = ['/', '/architecture', '/roadmap', '/social-profile'];

export default function sitemap(): MetadataRoute.Sitemap {
  return CONTENT_ROUTES.map((route) => ({
    url: `${SITE_URL}${route}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: route === '/' ? 1 : 0.7,
  }));
}
