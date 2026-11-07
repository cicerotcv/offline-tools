import { useMemo } from 'react';

import type { DerivationPath, DerivedKey } from '../../domain/bitcoin/config';
import type { BitcoinNetwork as Network } from '../../domain/bitcoin/network';
import { deriveBIP32Root, KeyDeriver } from '../../lib/derivation';

interface UseKeyDerivationOptions {
  seedBytes: Uint8Array | null;
  network: Network;
  derivationPath: DerivationPath;
  addressCount: number;
  enabled?: boolean; // Whether to auto-derive keys when seedBytes changes
}

interface UseKeyDerivationReturn {
  keys: DerivedKey[];
}

/**
 * Derives keys from seed bytes and derivation configuration
 * Automatically recomputes when seedBytes, network, path, or count changes
 */
export function useKeyDerivation({
  seedBytes,
  network,
  derivationPath,
  addressCount,
  enabled = true,
}: UseKeyDerivationOptions): UseKeyDerivationReturn {
  // Synchronous derivation for immediate computation (when seedBytes is available)
  const keys = useMemo((): DerivedKey[] => {
    if (!seedBytes || !enabled) {
      return [];
    }

    try {
      const root = deriveBIP32Root(seedBytes, network);
      return KeyDeriver.deriveKeysFromRoot(
        root,
        derivationPath,
        network,
        addressCount
      );
    } catch {
      return [];
    }
  }, [seedBytes, network, derivationPath, addressCount, enabled]);

  return { keys };
}
