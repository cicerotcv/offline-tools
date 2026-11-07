import { useEffect, useId, useState } from 'react';

import { Link } from '@tanstack/react-router';
import { ArrowRight } from 'lucide-react';

import { digestHex } from '@/modules/hash-tool/lib/digest';

const SAMPLE_INPUT = 'correct horse battery staple';

function groupHex(hex: string) {
  return hex.match(/.{1,8}/g) ?? [];
}

/** A working SHA-256 field, computed in this tab with the hash tool's lib. */
export function LiveHashPreview() {
  const inputId = useId();
  const [input, setInput] = useState(SAMPLE_INPUT);
  const [digest, setDigest] = useState<string | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const bytes = new TextEncoder().encode(input);

    digestHex(bytes, 'sha256')
      .then((hex) => {
        if (!cancelled) {
          setDigest(hex);
          setFailed(false);
        }
      })
      .catch(() => {
        if (!cancelled) setFailed(true);
      });

    return () => {
      cancelled = true;
    };
  }, [input]);

  return (
    <div className="rounded-xl border bg-card shadow-lg shadow-primary/10">
      <div
        className="flex items-center justify-between rounded-t-xl border-b
          bg-secondary/70 px-4 py-2.5"
      >
        <span className="font-mono text-xs font-medium text-accent-strong">
          SHA-256
        </span>
        <span className="text-xs text-muted-foreground">
          Computed in this tab
        </span>
      </div>

      <div className="space-y-4 p-4">
        <div className="space-y-2">
          <label htmlFor={inputId} className="text-sm font-medium">
            Input
          </label>
          <textarea
            id={inputId}
            value={input}
            onChange={(event) => setInput(event.target.value)}
            rows={2}
            spellCheck={false}
            className="block w-full resize-none rounded-md border border-input
              bg-card px-3 py-2 font-mono text-sm outline-none
              focus-visible:border-ring focus-visible:ring-[3px]
              focus-visible:ring-ring/40"
          />
        </div>

        <div className="space-y-2">
          <p className="text-sm font-medium">Digest</p>
          <output
            htmlFor={inputId}
            aria-live="polite"
            className="grid min-h-[3.25rem] grid-cols-4 gap-x-3 gap-y-1
              rounded-md bg-muted/60 px-3 py-2 font-mono text-[13px]
              text-muted-foreground tabular-nums sm:text-sm"
          >
            {failed ? (
              <span className="col-span-4 text-destructive">
                Web Crypto is unavailable in this context.
              </span>
            ) : digest ? (
              groupHex(digest).map((chunk, index) => (
                <span
                  key={index}
                  className={index === 0 ? 'text-accent-strong' : undefined}
                >
                  {chunk}
                </span>
              ))
            ) : (
              <span
                className="col-span-4 h-4 w-3/4 animate-pulse rounded-sm
                  bg-border"
              />
            )}
          </output>
        </div>
      </div>

      <Link
        to="/tools/hash"
        className="group flex items-center justify-between border-t px-4 py-3
          text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        Files, SHA-512 and checksum comparison
        <ArrowRight
          className="h-4 w-4 transition-transform group-hover:translate-x-0.5"
        />
      </Link>
    </div>
  );
}
