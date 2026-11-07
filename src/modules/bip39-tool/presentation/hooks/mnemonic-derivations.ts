import type { DerivationPath, DerivedKey } from '../../domain/bitcoin/config';
import type { BitcoinNetwork as Network } from '../../domain/bitcoin/network';
import { useCombinedAsyncState } from './combined-async-state';
import { useEntropyFromMnemonic } from './entropy-from-mnemonic';
import { useKeyDerivation } from './key-derivation';
import { useSeedFromMnemonic } from './seed-from-mnemonic';
import { useSeedHex } from './seed-hex';

interface UseMnemonicDerivationsOptions {
  mnemonic: string;
  passphrase: string;
  network: Network;
  derivationPath: DerivationPath;
  addressCount: number;
}

interface UseMnemonicDerivationsReturn {
  seedBytes: Uint8Array | null;
  seed: string; // Hex
  entropy: string; // Hex
  entropyBytes: Uint8Array | null;
  keys: DerivedKey[];
  isLoading: boolean;
  error: string;
}

/**
 * Automatically computes derivations from mnemonic and passphrase
 * No button click needed - computes when mnemonic is present
 */
export function useMnemonicDerivations({
  mnemonic,
  passphrase,
  network,
  derivationPath,
  addressCount,
}: UseMnemonicDerivationsOptions): UseMnemonicDerivationsReturn {
  // COMPUTED: seedBytes from mnemonic + passphrase (async)
  const {
    seedBytes,
    isLoading: isComputingSeed,
    error: seedError,
  } = useSeedFromMnemonic(mnemonic, passphrase);

  // COMPUTED: entropy from mnemonic
  const { entropyBytes, entropy } = useEntropyFromMnemonic(mnemonic);

  // COMPUTED: seed hex from seedBytes
  const seed = useSeedHex(seedBytes);

  // COMPUTED: keys from seedBytes + network + derivationPath + addressCount
  const { keys } = useKeyDerivation({
    seedBytes,
    network,
    derivationPath,
    addressCount,
    enabled: !!seedBytes,
  });

  // Combine errors and loading states
  const { error, isLoading } = useCombinedAsyncState({
    localError: '',
    localLoading: false,
    asyncError: seedError,
    asyncLoading: isComputingSeed,
  });

  return {
    seedBytes,
    seed,
    entropy,
    entropyBytes,
    keys,
    isLoading,
    error,
  };
}
