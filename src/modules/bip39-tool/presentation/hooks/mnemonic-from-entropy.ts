import { useCallback, useState } from 'react';

import type { WordCount } from '../../domain/bitcoin/config';
import {
  generateMnemonicFromEntropy,
  parseHexEntropy,
} from '../../lib/mnemonic';

interface UseMnemonicFromEntropyReturn {
  mnemonic: string | null;
  isLoading: boolean;
  error: string;
  generateMnemonic: (entropyHex: string, wordCount: WordCount) => Promise<void>;
  clearMnemonic: () => void;
}

/**
 * Hook to generate mnemonic from entropy (hex)
 */
export function useMnemonicFromEntropy(): UseMnemonicFromEntropyReturn {
  const [mnemonic, setMnemonic] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const generateMnemonic = async (entropyHex: string, wordCount: WordCount) => {
    setIsLoading(true);
    setError('');
    setMnemonic(null);

    try {
      // Parse hex entropy
      const entropy = parseHexEntropy(entropyHex);

      // Generate mnemonic from entropy
      const generatedMnemonic = await generateMnemonicFromEntropy(
        entropy,
        wordCount
      );

      setMnemonic(generatedMnemonic);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Failed to generate mnemonic from entropy'
      );
      setMnemonic(null);
    } finally {
      setIsLoading(false);
    }
  };

  const clearMnemonic = useCallback(() => {
    setMnemonic(null);
    setError('');
  }, []);

  return {
    mnemonic,
    isLoading,
    error,
    generateMnemonic,
    clearMnemonic,
  };
}
