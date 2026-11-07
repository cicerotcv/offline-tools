import { Link } from '@tanstack/react-router';
import { ArrowRight } from 'lucide-react';

import { Highlight } from '@/shared/presentation/components/highlight';

import { Button } from '$/components/ui/button';

import { SectionContainer } from './section-container';

const steps = [
  {
    title: 'Build',
    body: 'Clone the repository and build the self-contained page with its checksum.',
    code: 'pnpm release',
  },
  {
    title: 'Verify',
    body: 'On a trusted machine, compare the file hash with the published SHA-256 using the Hash Tool.',
    code: 'offline-tools.html.sha256',
  },
  {
    title: 'Transfer',
    body: 'Copy the generated file to removable media.',
    code: 'offline-tools.html',
  },
  {
    title: 'Open',
    body: 'Disconnect the network and open the file in any modern browser.',
    code: 'file:///…/offline-tools.html',
  },
];

export function OfflineUsageSection() {
  return (
    <SectionContainer
      labelledBy="offline-usage-title"
      className="bg-secondary/60"
    >
      <h2
        id="offline-usage-title"
        className="max-w-2xl text-3xl font-semibold tracking-tight sm:text-4xl"
      >
        Run it on an <span className="text-emphasis">air-gapped</span> machine.
      </h2>

      <ol className="mt-12 grid gap-10 md:grid-cols-2 md:gap-8 lg:grid-cols-4">
        {steps.map((step) => (
          <li key={step.title} className="border-t border-rule pt-5">
            <h3 className="font-semibold">{step.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              {step.body}
            </p>
            <code
              className="mt-4 inline-block rounded-md border bg-card px-2.5 py-1
                text-xs text-foreground"
            >
              {step.code}
            </code>
          </li>
        ))}
      </ol>

      <div
        className="mt-16 flex flex-col gap-5 rounded-xl border
          border-border-accent bg-card p-6 sm:flex-row sm:items-center
          sm:justify-between sm:p-8"
      >
        <p className="max-w-[48ch] text-muted-foreground">
          <span className="font-medium text-foreground">
            Want to look around first?
          </span>{' '}
          The hosted version behaves the same and{' '}
          <Highlight>still sends nothing</Highlight>.
        </p>
        <Button asChild size="lg" className="h-11 shrink-0 px-5">
          <Link to="/tools">
            Open tools
            <ArrowRight />
          </Link>
        </Button>
      </div>
    </SectionContainer>
  );
}
