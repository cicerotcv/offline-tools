import { useCallback, useState } from 'react';

import { parseHexEntropy } from '../../lib/mnemonic';

interface UseSeedFromHexReturn {
  seedBytes: Uint8Array | null;
  error: string | null;
  parseSeed: (seedHex: string) => boolean;
  clearSeed: () => void;
}

/**
 * Parses and validates seed hex string to seed bytes
 * Validates that the seed is exactly 64 bytes (128 hex characters)
 */
export function useSeedFromHex(): UseSeedFromHexReturn {
  const [seedBytes, setSeedBytes] = useState<Uint8Array | null>(null);
  const [error, setError] = useState<string | null>(null);

  const parseSeed = useCallback((seedHex: string): boolean => {
    if (!seedHex.trim()) {
      setSeedBytes(null);
      setError(null);
      return false;
    }

    try {
      const parsedSeed = parseHexEntropy(seedHex.trim());
      if (parsedSeed.length !== 64) {
        setError(
          'Invalid seed length. Master seed must be exactly 64 bytes (128 hex characters).'
        );
        setSeedBytes(null);
        return false;
      }
      setSeedBytes(parsedSeed);
      setError(null);
      return true;
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Invalid seed format. Please enter a valid hexadecimal string.'
      );
      setSeedBytes(null);
      return false;
    }
  }, []);

  const clearSeed = useCallback(() => {
    setSeedBytes(null);
    setError(null);
  }, []);

  return { seedBytes, error, parseSeed, clearSeed };
}
