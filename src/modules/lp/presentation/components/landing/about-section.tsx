import { ArrowUpRight } from 'lucide-react';

import {
  LICENSE,
  PUBLISHER,
  RELEASES_URL,
  REPO_URL,
  SECURITY_URL,
} from '@/shared/presentation/seo/site-config';

import { SectionContainer } from './section-container';

const facts = [
  {
    term: 'Maintainer',
    body: 'Built and maintained by one developer, published under a personal GitHub account.',
    link: { href: PUBLISHER.url, label: `@${PUBLISHER.name}` },
  },
  {
    term: 'License',
    body: 'Free and open source under the MIT license. Use, audit and fork it.',
    link: { href: LICENSE.url, label: `${LICENSE.name} license` },
  },
  {
    term: 'Source',
    body: 'Every line that runs in your browser is in the public repository, with the official test vectors it is checked against.',
    link: { href: REPO_URL, label: 'Repository' },
  },
  {
    term: 'Verify a release',
    body: 'Each release ships the single HTML file with its SHA-256 and a GitHub provenance attestation, and the build is reproducible from its tag. Check before opening the file offline.',
    link: { href: RELEASES_URL, label: 'Releases' },
  },
  {
    term: 'Report a vulnerability',
    body: 'Found wrong output or a way to leak a secret? Report it privately through a GitHub security advisory.',
    link: { href: SECURITY_URL, label: 'Report privately' },
  },
];

export function AboutSection() {
  return (
    <SectionContainer id="about" labelledBy="about-title">
      <div className="grid gap-12 lg:grid-cols-[1fr_1.6fr] lg:gap-20">
        <div>
          <h2
            id="about-title"
            className="max-w-md text-3xl font-semibold tracking-tight
              sm:text-4xl"
          >
            Who makes <span className="text-emphasis">Offline Tools</span>?
          </h2>
          <p className="mt-4 max-w-[48ch] text-muted-foreground">
            A tool that touches your keys should tell you who wrote it, under
            what terms and how to check it. Here is all of that.
          </p>
        </div>

        <dl className="grid gap-x-10 gap-y-9 sm:grid-cols-2">
          {facts.map((fact) => (
            <div key={fact.term} className="border-t border-rule pt-5">
              <dt className="font-semibold">{fact.term}</dt>
              <dd className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {fact.body}
              </dd>
              <dd className="mt-3">
                <a
                  href={fact.link.href}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 text-sm font-medium
                    text-accent-strong underline-offset-4 hover:underline"
                >
                  {fact.link.label}
                  <ArrowUpRight aria-hidden className="h-3.5 w-3.5" />
                </a>
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </SectionContainer>
  );
}
