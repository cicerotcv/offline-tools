import { useCallback } from 'react';

import { useAsyncMemo } from '@/shared/presentation/hooks/async-memo';

import { getSeedFromMnemonic } from '../../lib/mnemonic';

interface UseSeedFromMnemonicReturn {
  seedBytes: Uint8Array | null;
  isLoading: boolean;
  error: Error | null;
}

/**
 * Computes seed bytes from mnemonic and optional passphrase
 * Uses async memoization to avoid unnecessary recalculations
 */
export function useSeedFromMnemonic(
  mnemonic: string,
  passphrase: string
): UseSeedFromMnemonicReturn {
  const getSeedBytes = useCallback(
    () => getSeedFromMnemonic(mnemonic, passphrase),
    [mnemonic, passphrase]
  );

  const {
    value: seedBytes,
    isLoading,
    error,
  } = useAsyncMemo({
    fn: getSeedBytes,
    deps: [mnemonic, passphrase],
    initialValue: null,
    enabled: !!mnemonic.trim(),
  });

  return { seedBytes, isLoading, error };
}
