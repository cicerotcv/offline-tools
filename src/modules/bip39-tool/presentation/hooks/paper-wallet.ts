import { useCallback, useMemo, useState } from 'react';

import { makeCreatePaperWalletUseCase } from '../../application/bip39-tool.factory';
import type { BitcoinNetwork as Network } from '../../domain/bitcoin/network';
import {
  type AddressType,
  type PaperWalletResult,
} from '../../lib/paper-wallet';

export type {
  AddressType,
  PaperWalletResult as PaperWallet,
} from '../../lib/paper-wallet';

interface UsePaperWalletReturn {
  wallet: PaperWalletResult | null;
  isGenerating: boolean;
  error: string | null;
  generateWallet: (
    network: Network,
    addressType: AddressType,
    passphrase: string
  ) => Promise<void>;
  clearWallet: () => void;
}

export function usePaperWallet(): UsePaperWalletReturn {
  const createPaperWalletUseCase = useMemo(
    () => makeCreatePaperWalletUseCase(),
    []
  );
  const [wallet, setWallet] = useState<PaperWalletResult | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateWallet = useCallback(
    async (network: Network, addressType: AddressType, passphrase: string) => {
      try {
        setIsGenerating(true);
        setError(null);

        const result = await createPaperWalletUseCase.execute({
          network,
          addressType,
          passphrase,
        });
        setWallet(result);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : 'Failed to generate paper wallet'
        );
      } finally {
        setIsGenerating(false);
      }
    },
    [createPaperWalletUseCase]
  );

  const clearWallet = useCallback(() => {
    setWallet(null);
    setError(null);
  }, []);

  return {
    wallet,
    isGenerating,
    error,
    generateWallet,
    clearWallet,
  };
}
