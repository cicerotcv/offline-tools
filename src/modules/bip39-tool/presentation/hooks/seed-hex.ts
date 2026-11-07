import { useMemo } from 'react';

import { bytesToHex } from '../../lib/mnemonic';

/**
 * Computes seed hex string from seed bytes
 */
export function useSeedHex(seedBytes: Uint8Array | null): string {
  return useMemo(() => (seedBytes ? bytesToHex(seedBytes) : ''), [seedBytes]);
}
