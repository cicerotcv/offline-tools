import { BitGridMotif } from '@/shared/presentation/components/bit-grid-motif';
import { Highlight } from '@/shared/presentation/components/highlight';

import { SectionContainer } from './section-container';

const guarantees = [
  {
    title: 'No network calls',
    body: (
      <>
        <Highlight>There is no backend.</Highlight> The app loads no scripts or
        fonts from a CDN and ships without analytics or telemetry.
      </>
    ),
  },
  {
    title: 'One HTML file',
    body: (
      <>
        A single-file build bundles everything, fonts included, into{' '}
        <Highlight>one page you can checksum</Highlight> and carry on a USB
        stick.
      </>
    ),
  },
  {
    title: 'Opens from disk',
    body: 'Routing switches to hash mode on file://, so the app works straight from a folder on Tails or any offline system.',
  },
  {
    title: 'Auditable',
    body: 'The source is public, and the cryptography comes from established libraries: OpenPGP.js, bitcoinjs-lib and noble-hashes.',
  },
];

export function GuaranteesSection() {
  return (
    <SectionContainer
      labelledBy="guarantees-title"
      className="relative isolate overflow-hidden bg-band text-band-foreground"
    >
      <BitGridMotif
        cols={22}
        rows={4}
        density={0.35}
        seed={58}
        className="absolute bottom-0 left-0 -z-10 hidden w-[32rem] opacity-25
          lg:block"
      />

      <div className="grid gap-12 lg:grid-cols-[1fr_1.3fr] lg:gap-20">
        <div className="lg:sticky lg:top-24 lg:self-start">
          <h2
            id="guarantees-title"
            className="max-w-md text-3xl font-semibold tracking-tight
              sm:text-4xl"
          >
            Made for computers that{' '}
            <span className="text-emphasis-on-dark">stay offline.</span>
          </h2>
          <p className="mt-4 max-w-[52ch] text-band-muted">
            Seed phrases, private keys and passwords should be handled on a{' '}
            <Highlight>machine with no connection</Highlight>. These tools are
            built around that assumption.
          </p>
        </div>

        <dl className="grid gap-x-10 gap-y-9 sm:grid-cols-2">
          {guarantees.map((item) => (
            <div
              key={item.title}
              className="border-t border-band-foreground/15 pt-5"
            >
              <dt className="flex items-center gap-2.5 font-semibold">
                <span
                  aria-hidden
                  className="h-2.5 w-2.5 rounded-[2px] bg-numeral-on-dark"
                />
                {item.title}
              </dt>
              <dd className="mt-2 text-sm leading-relaxed text-band-muted">
                {item.body}
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </SectionContainer>
  );
}
