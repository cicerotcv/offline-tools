/**
 * Post-build step for the hosted build (never for build:single): writes one
 * HTML file per indexable route with its own head tags and a static copy of
 * the page content, plus 404.html, robots.txt and sitemap.xml.
 *
 * Usage: tsx scripts/generate-static-pages.ts
 */
import { execSync } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';

import {
  buildRouteHead,
  serializeRouteHead,
} from '../src/shared/presentation/seo/route-head';
import { SEO_PAGES } from '../src/shared/presentation/seo/seo-pages';
import {
  absoluteUrl,
  getSiteUrl,
} from '../src/shared/presentation/seo/site-config';
import {
  renderNotFoundShell,
  renderStaticShell,
} from '../src/shared/presentation/seo/static-shell';

const root = path.resolve(import.meta.dirname, '..');
const dist = path.join(root, 'dist');

/** Loads VITE_* keys from .env when the build environment did not set them. */
function loadDotEnv() {
  const file = path.join(root, '.env');
  if (!existsSync(file)) return;
  for (const line of readFileSync(file, 'utf8').split('\n')) {
    const match = /^\s*(VITE_[A-Z0-9_]+)\s*=\s*(.*)\s*$/.exec(line);
    if (match && !process.env[match[1]]) {
      process.env[match[1]] = match[2].replace(/^["']|["']$/g, '');
    }
  }
}

function lastCommitDate(): string | undefined {
  try {
    return (
      execSync('git log -1 --format=%cs', { cwd: root }).toString().trim() ||
      undefined
    );
  } catch {
    return undefined;
  }
}

function render(template: string, headHtml: string, shell: string): string {
  if (!template.includes('<div id="root"></div>')) {
    throw new Error('dist/index.html has no empty #root to fill');
  }
  return template
    .replace('</head>', `    ${headHtml}\n  </head>`)
    .replace('<div id="root"></div>', `<div id="root">${shell}</div>`);
}

function write(file: string, content: string) {
  mkdirSync(path.dirname(file), { recursive: true });
  writeFileSync(file, content);
}

function main() {
  if (process.env.VITE_SINGLE_FILE === 'true') {
    console.log('Single-file build: skipping static pages.');
    return;
  }
  loadDotEnv();

  const template = readFileSync(path.join(dist, 'index.html'), 'utf8');

  for (const page of SEO_PAGES) {
    const html = render(
      template,
      serializeRouteHead(buildRouteHead(page)),
      renderStaticShell(page)
    );
    write(
      page.path === '/'
        ? path.join(dist, 'index.html')
        : path.join(dist, page.path, 'index.html'),
      html
    );
  }

  write(
    path.join(dist, '404.html'),
    render(
      template,
      '<title data-static-head>Page not found | Offline Tools</title>\n    <meta data-static-head name="robots" content="noindex" />',
      renderNotFoundShell()
    )
  );

  const lastmod = lastCommitDate();
  write(
    path.join(dist, 'sitemap.xml'),
    `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${SEO_PAGES.map(
      (page) =>
        `  <url>\n    <loc>${absoluteUrl(page.path)}</loc>${lastmod ? `\n    <lastmod>${lastmod}</lastmod>` : ''}\n  </url>`
    ).join('\n')}\n</urlset>\n`
  );

  write(
    path.join(dist, 'robots.txt'),
    `# Every crawler is welcome, including AI search and training bots.\nUser-agent: *\nAllow: /\n\nSitemap: ${getSiteUrl()}/sitemap.xml\n`
  );

  console.log(
    `Static pages: ${SEO_PAGES.length} routes, 404.html, sitemap.xml, robots.txt (${getSiteUrl()})`
  );
}

main();
