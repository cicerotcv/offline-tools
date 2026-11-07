/**
 * Site-wide facts used by the head, JSON-LD, static pages and sitemap.
 * Values come from the build environment; nothing here is fetched at runtime.
 */
export const SITE_NAME = 'Offline Tools';

export const REPO_URL = 'https://github.com/cicerotcv/offline-tools';

export const PUBLISHER = {
  name: 'cicerotcv',
  url: 'https://github.com/cicerotcv',
} as const;

export const LICENSE = {
  name: 'MIT',
  url: `${REPO_URL}/blob/main/LICENSE`,
} as const;

export const OG_IMAGE_PATH = '/og-image.png';

const FALLBACK_SITE_URL = 'https://offline-tools-taupe.vercel.app';

/** Reads Vite env in the app and process.env in Node build scripts. */
function readEnv(name: 'VITE_SITE_URL' | 'VITE_GOOGLE_SITE_VERIFICATION') {
  const fromProcess =
    typeof process !== 'undefined' ? process.env?.[name] : undefined;
  const fromVite = (import.meta as { env?: Record<string, string> }).env?.[
    name
  ];
  return fromProcess || fromVite || undefined;
}

export function getSiteUrl(): string {
  return (readEnv('VITE_SITE_URL') ?? FALLBACK_SITE_URL).replace(/\/$/, '');
}

export function getGoogleSiteVerification(): string | undefined {
  return readEnv('VITE_GOOGLE_SITE_VERIFICATION');
}

export function absoluteUrl(path: string): string {
  return path === '/' ? `${getSiteUrl()}/` : `${getSiteUrl()}${path}`;
}

export const RELEASES_URL = `${REPO_URL}/releases`;
export const SECURITY_URL = `${REPO_URL}/security/advisories/new`;

/** Shared by the tool guide and the static pages. */
export const OFFLINE_STEPS = [
  'Download the single-file release from GitHub together with its SHA-256 checksum.',
  'On a trusted machine, compare the checksum with the Hash Tool or shasum.',
  'Copy the file to the offline computer and open it in a browser.',
] as const;
