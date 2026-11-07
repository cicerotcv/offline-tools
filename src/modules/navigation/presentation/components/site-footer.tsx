import { Link } from '@tanstack/react-router';

import { BitGridMotif } from '@/shared/presentation/components/bit-grid-motif';
import {
  LICENSE,
  RELEASES_URL,
  REPO_URL,
  SECURITY_URL,
} from '@/shared/presentation/seo/site-config';

export function SiteFooter() {
  return (
    <footer className="overflow-hidden border-t">
      <BitGridMotif
        cols={64}
        rows={2}
        density={0.7}
        seed={4}
        className="block h-auto w-full min-w-[56rem] opacity-25"
      />
      <div
        className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-8 text-sm
          text-muted-foreground sm:flex-row sm:items-center sm:justify-between
          sm:px-6 lg:px-8"
      >
        <p>
          Offline Tools{' '}
          <a
            href={`${RELEASES_URL}/tag/v${__APP_VERSION__}`}
            target="_blank"
            rel="noreferrer"
            className="font-mono text-xs hover:text-foreground"
          >
            v{__APP_VERSION__}
          </a>{' '}
          runs entirely in your browser. Nothing you type is sent anywhere.
        </p>
        <nav aria-label="Footer" className="flex flex-wrap gap-x-5 gap-y-2">
          <Link to="/tools" className="hover:text-foreground">
            Tools
          </Link>
          <Link to="/" hash="about" className="hover:text-foreground">
            About
          </Link>
          {[
            { href: REPO_URL, label: 'Source' },
            { href: LICENSE.url, label: 'License' },
            { href: SECURITY_URL, label: 'Security' },
          ].map((item) => (
            <a
              key={item.label}
              href={item.href}
              target="_blank"
              rel="noreferrer"
              className="hover:text-foreground"
            >
              {item.label}
            </a>
          ))}
        </nav>
      </div>
    </footer>
  );
}
