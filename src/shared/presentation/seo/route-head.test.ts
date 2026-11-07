import { describe, expect, it } from 'vitest';

import { buildRouteHead, serializeRouteHead } from './route-head';
import { getSeoPage, SEO_PAGES } from './seo-pages';

describe('route head', () => {
  it.each(SEO_PAGES.map((page) => [page.path, page]))(
    '%s has title, description, canonical, OG and valid JSON-LD',
    (path, page) => {
      const head = buildRouteHead(page);
      expect(head.meta).toContainEqual({ title: page.title });
      expect(head.meta).toContainEqual({
        name: 'description',
        content: page.description,
      });
      const canonical = head.links.find((link) => link.rel === 'canonical')!;
      expect(canonical.href.endsWith(path === '/' ? '/' : path)).toBe(true);
      expect(head.meta.some((m) => m.property === 'og:image')).toBe(true);

      const jsonLd = JSON.parse(head.scripts[0].children);
      expect(jsonLd['@context']).toBe('https://schema.org');
      const types = jsonLd['@graph'].map(
        (node: { '@type': string }) => node['@type']
      );
      expect(types.length).toBeGreaterThan(0);
      expect(types).not.toContain('AggregateRating');
      expect(types).not.toContain('FAQPage');
    }
  );

  it('describes each tool as a free WebApplication with a breadcrumb', () => {
    const graph = JSON.parse(
      buildRouteHead(getSeoPage('/tools/hash')!).scripts[0].children
    )['@graph'];
    const app = graph.find(
      (n: { '@type': string }) => n['@type'] === 'WebApplication'
    );
    expect(app.isAccessibleForFree).toBe(true);
    expect(app.offers.price).toBe('0');
    expect(
      graph.some((n: { '@type': string }) => n['@type'] === 'BreadcrumbList')
    ).toBe(true);
  });

  it('serializes escaped HTML and keeps JSON-LD inert', () => {
    const html = serializeRouteHead({
      meta: [{ title: 'A & B' }, { name: 'description', content: '"x" <y>' }],
      links: [{ rel: 'canonical', href: 'https://e.test/a' }],
      scripts: [
        { type: 'application/ld+json', children: '{"a":"\\u003c/script>"}' },
      ],
    });
    expect(html).toContain('<title data-static-head>A &amp; B</title>');
    expect(html).toContain('content="&quot;x&quot; &lt;y&gt;"');
    expect(html).not.toContain('</script></script>');
  });
});
