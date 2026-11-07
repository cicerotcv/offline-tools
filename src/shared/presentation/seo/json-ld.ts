import { getTool } from '@/shared/presentation/tools/tool-registry';

import type { SeoPage } from './seo-pages';
import { SEO_PAGES } from './seo-pages';
import {
  absoluteUrl,
  LICENSE,
  PUBLISHER,
  REPO_URL,
  SITE_NAME,
} from './site-config';

type JsonLd = Record<string, unknown>;

const publisher = (): JsonLd => ({
  '@type': 'Person',
  '@id': `${PUBLISHER.url}#person`,
  name: PUBLISHER.name,
  url: PUBLISHER.url,
  sameAs: [PUBLISHER.url],
});

const breadcrumb = (page: SeoPage): JsonLd => ({
  '@type': 'BreadcrumbList',
  itemListElement: [
    {
      '@type': 'ListItem',
      position: 1,
      name: SITE_NAME,
      item: absoluteUrl('/'),
    },
    {
      '@type': 'ListItem',
      position: 2,
      name: 'Tools',
      item: absoluteUrl('/tools'),
    },
    ...(page.kind === 'tool'
      ? [
          {
            '@type': 'ListItem',
            position: 3,
            name: page.heading,
            item: absoluteUrl(page.path),
          },
        ]
      : []),
  ],
});

/** Structured data for a page: real facts only, no ratings or FAQ markup. */
export function buildJsonLd(page: SeoPage): JsonLd {
  const graph: JsonLd[] = [];

  if (page.kind === 'home') {
    graph.push(
      {
        '@type': 'WebSite',
        '@id': `${absoluteUrl('/')}#website`,
        name: SITE_NAME,
        url: absoluteUrl('/'),
        description: page.description,
        inLanguage: 'en',
        publisher: { '@id': `${PUBLISHER.url}#person` },
      },
      publisher()
    );
  }

  if (page.kind === 'catalog') {
    const tools = SEO_PAGES.filter((p) => p.kind === 'tool');
    graph.push(
      {
        '@type': 'CollectionPage',
        name: page.heading,
        url: absoluteUrl(page.path),
        description: page.description,
        mainEntity: {
          '@type': 'ItemList',
          numberOfItems: tools.length,
          itemListElement: tools.map((tool, index) => ({
            '@type': 'ListItem',
            position: index + 1,
            name: tool.heading,
            url: absoluteUrl(tool.path),
          })),
        },
      },
      breadcrumb(page)
    );
  }

  if (page.kind === 'tool' && page.toolId) {
    const tool = getTool(page.toolId);
    graph.push(
      {
        '@type': 'WebApplication',
        name: page.heading,
        url: absoluteUrl(page.path),
        description: page.description,
        applicationCategory:
          tool.category === 'utilities'
            ? 'UtilitiesApplication'
            : 'SecurityApplication',
        operatingSystem: 'Any',
        browserRequirements: 'Requires JavaScript and a modern browser',
        isAccessibleForFree: true,
        offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
        license: LICENSE.url,
        codeRepository: REPO_URL,
        author: { '@id': `${PUBLISHER.url}#person` },
      },
      breadcrumb(page),
      publisher()
    );
  }

  return { '@context': 'https://schema.org', '@graph': graph };
}
