import type { ToolId } from '@/shared/domain/tools';
import { TOOLS } from '@/shared/presentation/tools/tool-registry';

import { SITE_NAME } from './site-config';

export const SEO_PAGE_KINDS = ['home', 'catalog', 'tool'] as const;
export type SeoPageKind = (typeof SEO_PAGE_KINDS)[number];

/** One indexable route: the input for head tags, static HTML and sitemap. */
export interface SeoPage {
  path: string;
  kind: SeoPageKind;
  /** Full <title>, suffix included. */
  title: string;
  description: string;
  heading: string;
  intro: string;
  toolId?: ToolId;
}

const withSiteName = (title: string) => `${title} | ${SITE_NAME}`;

export const SEO_PAGES: readonly SeoPage[] = [
  {
    path: '/',
    kind: 'home',
    title: withSiteName('Offline Bitcoin Seed, Hash & Encryption Tools'),
    description:
      'Hash files, encrypt with OpenPGP, split secrets and generate BIP39 seeds in your browser. No server, no network; runs from a USB stick or Tails.',
    heading: 'Cryptography that never leaves your machine.',
    intro:
      'Offline Tools is a free, open-source set of cryptography and Bitcoin tools that run entirely in your browser: hashing, OpenPGP encryption, Shamir secret sharing, BIP39 seeds and paper wallets. Nothing you type is sent anywhere, and the whole app can run from a single HTML file on an offline computer.',
  },
  {
    path: '/tools',
    kind: 'catalog',
    title: withSiteName(`All ${TOOLS.length} Offline Crypto & Bitcoin Tools`),
    description:
      'Hashing, OpenPGP encryption, Shamir secret sharing, BIP39 seeds, paper wallets and QR codes. Every tool runs in this tab with no network access.',
    heading: 'Tools',
    intro:
      'Every tool runs in this tab with no network access. Each one checks its cryptography against known test vectors before it opens.',
  },
  ...TOOLS.map(
    (tool): SeoPage => ({
      path: tool.path,
      kind: 'tool',
      title: withSiteName(tool.seoTitle),
      description: tool.seoDescription,
      heading: tool.heading,
      intro: tool.intro,
      toolId: tool.id,
    })
  ),
];

export function getSeoPage(path: string): SeoPage | undefined {
  return SEO_PAGES.find((page) => page.path === path);
}
