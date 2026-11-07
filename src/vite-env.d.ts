/// <reference types="vite/client" />

/** package.json version, injected at build time. */
declare const __APP_VERSION__: string;

interface ImportMetaEnv {
  /** Production origin, HTTPS, no trailing slash (canonical, OG, sitemap). */
  readonly VITE_SITE_URL?: string;
  /** Google Search Console token; emitted as a meta tag only. */
  readonly VITE_GOOGLE_SITE_VERIFICATION?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
