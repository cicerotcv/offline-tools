import { useMemo } from 'react';

import { bytesToHex, getEntropyFromMnemonic } from '../../lib/mnemonic';

interface UseEntropyFromMnemonicReturn {
  entropyBytes: Uint8Array | null;
  entropy: string; // Hex
}

/**
 * Computes entropy from mnemonic phrase
 * Returns both bytes and hex representation
 */
export function useEntropyFromMnemonic(
  mnemonic: string
): UseEntropyFromMnemonicReturn {
  const entropyBytes = useMemo(() => {
    if (!mnemonic.trim()) return null;
    try {
      return getEntropyFromMnemonic(mnemonic);
    } catch {
      return null;
    }
  }, [mnemonic]);

  const entropy = useMemo(
    () => (entropyBytes ? bytesToHex(entropyBytes) : ''),
    [entropyBytes]
  );

  return { entropyBytes, entropy };
}
