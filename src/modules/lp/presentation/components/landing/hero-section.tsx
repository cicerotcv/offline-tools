import { Link } from '@tanstack/react-router';
import { ArrowRight } from 'lucide-react';

import { BitGridMotif } from '@/shared/presentation/components/bit-grid-motif';
import { Highlight } from '@/shared/presentation/components/highlight';
import { TOOLS } from '@/shared/presentation/tools/tool-registry';

import { REPO_URL } from '@/modules/navigation/lib/site';

import { Button } from '$/components/ui/button';

import { LiveHashPreview } from './live-hash-preview';

export function HeroSection() {
  return (
    <section
      aria-labelledby="hero-title"
      className="relative overflow-hidden border-b px-4 pt-16 pb-20 sm:px-6
        sm:pt-20 lg:px-8 lg:pt-24 lg:pb-28"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0
          bg-[radial-gradient(55%_60%_at_88%_0%,var(--secondary),transparent_70%)]
          dark:bg-[radial-gradient(55%_60%_at_88%_0%,color-mix(in_oklab,var(--primary)_14%,transparent),transparent_70%)]"
      />
      <div
        aria-hidden
        className="bg-grain pointer-events-none absolute inset-0 opacity-[0.035]
          dark:opacity-[0.07]"
      />
      <BitGridMotif
        cols={22}
        rows={3}
        density={0.22}
        seed={21}
        animate
        className="absolute right-0 bottom-0 hidden w-[24rem] opacity-90
          lg:block"
      />

      <div
        className="relative mx-auto grid max-w-7xl items-center gap-14
          lg:grid-cols-[1.1fr_1fr] lg:gap-20"
      >
        <div>
          <h1
            id="hero-title"
            className="max-w-[16ch] text-4xl leading-[1.05] font-semibold
              tracking-tighter md:text-5xl lg:text-6xl"
          >
            Cryptography that{' '}
            <span className="text-emphasis">never leaves</span> your machine.
          </h1>
          <p
            className="mt-6 max-w-[56ch] text-lg leading-relaxed
              text-muted-foreground"
          >
            Offline Tools is a free, open-source set of {TOOLS.length} browser
            tools for BIP39 seed phrases, BIP38 paper wallets, Shamir secret
            sharing, OpenPGP encryption, hashing and QR codes.{' '}
            <Highlight>No backend, no network</Highlight>: the single-file build
            opens from a USB stick on an offline machine.
          </p>
          <div className="mt-9 flex flex-wrap items-center gap-x-6 gap-y-4">
            <Button asChild size="lg" className="h-11 px-5">
              <Link to="/tools">
                Open tools
                <ArrowRight />
              </Link>
            </Button>
            <a
              href={REPO_URL}
              target="_blank"
              rel="noreferrer"
              className="text-sm font-medium text-muted-foreground
                underline-offset-4 transition-colors hover:text-foreground
                hover:underline"
            >
              Read the source
            </a>
          </div>
        </div>

        <div
          className="animate-in delay-150 duration-700 fill-mode-both fade-in
            slide-in-from-bottom-3 motion-reduce:animate-none"
        >
          <LiveHashPreview />
        </div>
      </div>
    </section>
  );
}
