import { buildJsonLd } from './json-ld';
import type { SeoPage } from './seo-pages';
import {
  absoluteUrl,
  getGoogleSiteVerification,
  OG_IMAGE_PATH,
  SITE_NAME,
} from './site-config';

export interface RouteHead {
  meta: Array<Record<string, string>>;
  links: Array<{ rel: string; href: string } & Record<string, string>>;
  scripts: Array<{ type: string; children: string }>;
}

/** Head tags for an indexable page (used at runtime and in static HTML). */
export function buildRouteHead(page: SeoPage): RouteHead {
  const url = absoluteUrl(page.path);
  const image = absoluteUrl(OG_IMAGE_PATH);
  const verification =
    page.kind === 'home' ? getGoogleSiteVerification() : undefined;

  return {
    meta: [
      { title: page.title },
      { name: 'description', content: page.description },
      { property: 'og:type', content: 'website' },
      { property: 'og:site_name', content: SITE_NAME },
      { property: 'og:title', content: page.title },
      { property: 'og:description', content: page.description },
      { property: 'og:url', content: url },
      { property: 'og:image', content: image },
      { property: 'og:image:width', content: '1200' },
      { property: 'og:image:height', content: '630' },
      { name: 'twitter:card', content: 'summary_large_image' },
      { name: 'twitter:title', content: page.title },
      { name: 'twitter:description', content: page.description },
      { name: 'twitter:image', content: image },
      ...(verification
        ? [{ name: 'google-site-verification', content: verification }]
        : []),
    ],
    links: [{ rel: 'canonical', href: url }],
    scripts: [
      {
        type: 'application/ld+json',
        // Escape "<" so the JSON can never close the script element.
        children: JSON.stringify(buildJsonLd(page)).replace(/</g, '\\u003c'),
      },
    ],
  };
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

const attributes = (record: Record<string, string>) =>
  Object.entries(record)
    .map(([key, value]) => `${key}="${escapeHtml(value)}"`)
    .join(' ');

/** Marks prerendered head tags so the app can drop them before React mounts. */
export const STATIC_HEAD_ATTRIBUTE = 'data-static-head';

/** Same tags as HTML, for the static per-route pages. */
export function serializeRouteHead(head: RouteHead): string {
  const mark = STATIC_HEAD_ATTRIBUTE;
  return [
    ...head.meta.map((meta) =>
      'title' in meta
        ? `<title ${mark}>${escapeHtml(meta.title)}</title>`
        : `<meta ${mark} ${attributes(meta)} />`
    ),
    ...head.links.map((link) => `<link ${mark} ${attributes(link)} />`),
    ...head.scripts.map(
      (script) =>
        `<script ${mark} type="${escapeHtml(script.type)}">${script.children}</script>`
    ),
  ].join('\n    ');
}
