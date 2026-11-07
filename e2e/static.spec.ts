import { expect, test } from '@playwright/test';

import { SEO_PAGES } from '../src/shared/presentation/seo/seo-pages';

const decode = (html: string) =>
  html
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");

test.describe('what crawlers receive (raw HTML, no JavaScript)', () => {
  for (const page of SEO_PAGES) {
    test(`${page.path} has its own head, heading, copy and JSON-LD`, async ({
      request,
    }) => {
      const response = await request.get(page.path);
      expect(response.status()).toBe(200);
      const html = decode(await response.text());

      expect(html).toContain(`>${page.title}</title>`);
      expect(html).toContain(`content="${page.description}"`);
      expect(html).toMatch(
        /<link data-static-head rel="canonical" href="https:\/\/[^"]+"/
      );
      expect(html).toContain(`>${page.heading}</h1>`);
      expect(html).toContain(page.intro);

      const jsonLd =
        /<script data-static-head type="application\/ld\+json">([\s\S]*?)<\/script>/.exec(
          html
        );
      expect(jsonLd).not.toBeNull();
      expect(JSON.parse(jsonLd![1])['@context']).toBe('https://schema.org');
    });
  }

  test('unknown paths return a real 404', async ({ request }) => {
    for (const path of ['/tools/jwt', '/does-not-exist', '/TOOLS/hash']) {
      const response = await request.get(path);
      expect(response.status(), path).toBe(404);
      expect(await response.text()).toContain('Page not found.');
    }
  });

  test('a trailing slash redirects permanently to the canonical path', async ({
    request,
  }) => {
    const response = await request.get('/tools/hash/', { maxRedirects: 0 });
    expect([301, 308]).toContain(response.status());
    expect(response.headers()['location']).toBe('/tools/hash');
  });

  test('the merged Entropy Generation URL redirects to Seed Generation', async ({
    request,
  }) => {
    const response = await request.get('/tools/entropy-generation', {
      maxRedirects: 0,
    });
    expect(response.status()).toBe(308);
    expect(response.headers()['location']).toBe('/tools/seed-generation');
  });

  test('robots.txt and sitemap.xml are real files', async ({ request }) => {
    const robots = await request.get('/robots.txt');
    expect(robots.headers()['content-type']).toContain('text/plain');
    expect(await robots.text()).toMatch(
      /^Sitemap: https:\/\/.+\/sitemap\.xml$/m
    );

    const sitemap = await request.get('/sitemap.xml');
    expect(sitemap.headers()['content-type']).toContain('xml');
    const locs = (await sitemap.text()).match(/<loc>/g) ?? [];
    expect(locs).toHaveLength(SEO_PAGES.length);
  });

  test('security headers are sent', async ({ request }) => {
    const headers = (await request.get('/')).headers();
    expect(headers['content-security-policy']).toContain(
      "frame-ancestors 'none'"
    );
    expect(headers['x-content-type-options']).toBe('nosniff');
    expect(headers['referrer-policy']).toBe('no-referrer');
  });
});

test.describe('what users get after the app mounts', () => {
  test('the static copy is replaced, not duplicated, and titles follow navigation', async ({
    page,
  }) => {
    const errors: string[] = [];
    page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
    page.on('pageerror', (e) => errors.push(e.message));

    const hash = SEO_PAGES.find((p) => p.path === '/tools/hash')!;
    await page.goto(hash.path);
    await expect(page.locator('[data-slot="tabs-list"]').first()).toBeVisible();
    await expect(page.locator('h1')).toHaveCount(1);
    await expect(page).toHaveTitle(hash.title);
    await expect(page.locator('[data-static-head]')).toHaveCount(0);

    const target = SEO_PAGES.find((p) => p.path === '/tools/encryption')!;
    await page.getByRole('link', { name: 'Encryption Tool' }).first().click();
    await expect(page).toHaveTitle(target.title);
    expect(errors).toEqual([]);
  });
});
