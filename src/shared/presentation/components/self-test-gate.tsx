import { type ReactNode, useEffect, useState } from 'react';

import { Link } from '@tanstack/react-router';

import { Button } from '$/components/ui/button';
import { ErrorPanel } from '$/components/ui/error-panel';

export type SelfTestState =
  | { status: 'none' }
  | { status: 'running' }
  | { status: 'passed' }
  | { status: 'failed'; detail: string };

/** One run per tool per page load; results hold no secret material. */
const results = new Map<string, Promise<void>>();

interface SelfTestSpec {
  /** Cache key; tools sharing a key share one run. */
  key: string;
  /** Resolves when known-answer checks pass; rejects otherwise. */
  run: () => Promise<void>;
}

/** Runs (once per page load) the known-answer self-test of a tool. */
export function useSelfTest(spec: SelfTestSpec | undefined): SelfTestState {
  const key = spec?.key;
  const run = spec?.run;
  const [state, setState] = useState<SelfTestState>(
    spec ? { status: 'running' } : { status: 'none' }
  );

  useEffect(() => {
    if (!key || !run) {
      setState({ status: 'none' });
      return;
    }
    let cancelled = false;
    setState({ status: 'running' });
    let pending = results.get(key);
    if (!pending) {
      pending = run();
      results.set(key, pending);
    }
    pending.then(
      () => !cancelled && setState({ status: 'passed' }),
      (error: unknown) =>
        !cancelled && setState({ status: 'failed', detail: String(error) })
    );
    return () => {
      cancelled = true;
    };
  }, [key, run]);

  return state;
}

interface SelfTestGateProps {
  state: SelfTestState;
  children: ReactNode;
}

/**
 * Shows a tool only after its self-test passed. A failure means the crypto
 * runtime in this browser or build is not trustworthy, so the tool stays
 * disabled instead of producing wrong output.
 */
export function SelfTestGate({ state, children }: SelfTestGateProps) {
  if (state.status === 'passed' || state.status === 'none') return children;

  if (state.status === 'failed') {
    return (
      <ErrorPanel
        code="Self-test"
        title="This tool is disabled."
        description="Its cryptographic self-test failed in this browser, so it could produce wrong keys, addresses or digests. Try another up-to-date browser or a fresh copy of the app."
        detail={import.meta.env.DEV ? state.detail : undefined}
        actions={
          <Button asChild variant="outline">
            <Link to="/tools">All tools</Link>
          </Button>
        }
      />
    );
  }

  // Reserve the viewport so swapping in the tool does not move the footer.
  return <div aria-busy className="min-h-[100svh]" />;
}
