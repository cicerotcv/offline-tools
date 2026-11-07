import { buildRouteHead } from '@/shared/presentation/seo/route-head';
import { getSeoPage } from '@/shared/presentation/seo/seo-pages';

/** Route `head` option for an indexable path declared in SEO_PAGES. */
export function seoHead(path: string) {
  const page = getSeoPage(path);
  if (!page) throw new Error(`No SEO page declared for ${path}`);
  return () => buildRouteHead(page);
}
