import { useCallback, useEffect, useState } from 'react';

import type { DerivationPath, DerivedKey } from '../../domain/bitcoin/config';
import type { BitcoinNetwork as Network } from '../../domain/bitcoin/network';
import { KeyDeriver } from '../../lib/derivation';
import { useCombinedAsyncState } from './combined-async-state';
import { useEntropyFromMnemonic } from './entropy-from-mnemonic';
import { useGenerationFlag } from './generation-flag';
import { useKeyDerivation } from './key-derivation';
import { useMnemonicFromEntropy } from './mnemonic-from-entropy';
import { useSeedFromHex } from './seed-from-hex';
import { useSeedFromMnemonic } from './seed-from-mnemonic';
import { useSeedHex } from './seed-hex';

interface UseWalletRecoveryOptions {
  network: Network;
  derivationPath: DerivationPath;
  addressCount: number;
}

interface UseWalletRecoveryReturn {
  mnemonic: string;
  seedHex: string;
  entropyHex: string;
  extendedPrivateKey: string;
  extendedPublicKey: string;
  passphrase: string;
  seed: string; // Computed seed (from mnemonic or seedHex)
  entropy: string; // Computed entropy (only if mnemonic provided)
  keys: DerivedKey[];
  isLoading: boolean;
  error: string;
  setMnemonic: (mnemonic: string) => void;
  setSeedHex: (seedHex: string) => void;
  setEntropyHex: (entropyHex: string) => void;
  setExtendedPrivateKey: (key: string) => void;
  setExtendedPublicKey: (key: string) => void;
  setPassphrase: (passphrase: string) => void;
  handleRecover: () => Promise<void>;
}

export function useWalletRecovery({
  network,
  derivationPath,
  addressCount,
}: UseWalletRecoveryOptions): UseWalletRecoveryReturn {
  const [mnemonic, setMnemonic] = useState('');
  const [seedHex, setSeedHex] = useState('');
  const [entropyHex, setEntropyHex] = useState('');
  const [extendedPrivateKey, setExtendedPrivateKey] = useState('');
  const [extendedPublicKey, setExtendedPublicKey] = useState('');
  const [passphrase, setPassphrase] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [recoveredKeys, setRecoveredKeys] = useState<DerivedKey[]>([]);

  // Hook for generating mnemonic from entropy
  const {
    mnemonic: mnemonicFromEntropy,
    isLoading: isGeneratingMnemonic,
    error: entropyError,
    generateMnemonic: generateMnemonicFromEntropy,
    clearMnemonic: clearMnemonicFromEntropy,
  } = useMnemonicFromEntropy();

  // Generation flag - tracks if recovery has been performed
  const { isGenerated, setGenerated } = useGenerationFlag({
    dependencies: [
      mnemonic,
      seedHex,
      entropyHex,
      extendedPrivateKey,
      extendedPublicKey,
      passphrase,
    ],
  });

  // Use mnemonic from entropy if entropy was provided and mnemonic generated
  const effectiveMnemonic = mnemonic || mnemonicFromEntropy || '';

  // COMPUTED: seedBytes from mnemonic (if mnemonic provided, including from entropy)
  const {
    seedBytes: seedBytesFromMnemonic,
    isLoading: isComputingSeedFromMnemonic,
    error: seedError,
  } = useSeedFromMnemonic(effectiveMnemonic, passphrase);

  // COMPUTED: seedBytes from hex (if seedHex provided)
  const {
    seedBytes: seedBytesFromHex,
    error: hexError,
    parseSeed,
    clearSeed,
  } = useSeedFromHex();

  // Use seedBytes from mnemonic if available, otherwise from hex
  const seedBytes = seedBytesFromMnemonic || seedBytesFromHex;

  // COMPUTED: entropy from mnemonic (only if mnemonic provided)
  const { entropy } = useEntropyFromMnemonic(effectiveMnemonic);

  // COMPUTED: seed hex from seedBytes
  const seed = useSeedHex(seedBytes);

  // COMPUTED: keys from seedBytes + network + derivationPath + addressCount
  // Only use this if we're recovering from seed/mnemonic, not from extended keys
  const { keys: keysFromSeed } = useKeyDerivation({
    seedBytes,
    network,
    derivationPath,
    addressCount,
    enabled:
      !!seedBytes && isGenerated && !extendedPrivateKey && !extendedPublicKey,
  });

  // Use recovered keys if available, otherwise use keys from seed
  const keys = recoveredKeys.length > 0 ? recoveredKeys : keysFromSeed;

  // Re-derive keys when addressCount or network changes for extended keys
  useEffect(() => {
    if (!isGenerated) return;

    // Only re-derive if we have extended keys
    if (extendedPrivateKey.trim()) {
      try {
        const newKeys = KeyDeriver.deriveKeysFromExtendedPrivateKey(
          extendedPrivateKey.trim(),
          network,
          derivationPath,
          addressCount
        );
        setRecoveredKeys(newKeys);
      } catch (err) {
        // Silently fail - user will see error if they try to recover again
        console.error('Failed to re-derive keys:', err);
      }
    } else if (extendedPublicKey.trim()) {
      try {
        const newKeys = KeyDeriver.deriveKeysFromExtendedPublicKey(
          extendedPublicKey.trim(),
          network,
          derivationPath,
          addressCount
        );
        setRecoveredKeys(newKeys);
      } catch (err) {
        // Silently fail - user will see error if they try to recover again
        console.error('Failed to re-derive keys:', err);
      }
    }
  }, [
    addressCount,
    network,
    derivationPath,
    extendedPrivateKey,
    extendedPublicKey,
    isGenerated,
  ]);

  const handleRecover = useCallback(async () => {
    setIsLoading(true);
    setError('');
    setRecoveredKeys([]);
    clearMnemonicFromEntropy();

    try {
      if (extendedPrivateKey.trim()) {
        // Recover from extended private key (xprv/yprv/zprv)
        const keys = KeyDeriver.deriveKeysFromExtendedPrivateKey(
          extendedPrivateKey.trim(),
          network,
          derivationPath,
          addressCount
        );
        setRecoveredKeys(keys);
        setGenerated(true);
      } else if (extendedPublicKey.trim()) {
        // Recover from extended public key (xpub/ypub/zpub) - watch-only
        const keys = KeyDeriver.deriveKeysFromExtendedPublicKey(
          extendedPublicKey.trim(),
          network,
          derivationPath,
          addressCount
        );
        setRecoveredKeys(keys);
        setGenerated(true);
      } else if (entropyHex.trim()) {
        // Recover from entropy - first generate mnemonic, then proceed
        // Default to 24 words for entropy recovery
        await generateMnemonicFromEntropy(entropyHex.trim(), 24);
        // The mnemonic will be generated and then seedBytes will be computed
        // We need to wait for the mnemonic to be generated
        // For now, set generated flag - the keys will be computed via useKeyDerivation
        setGenerated(true);
      } else if (mnemonic.trim()) {
        // Recover from mnemonic - seedBytes will be computed automatically via useSeedFromMnemonic
        setGenerated(true);
      } else if (seedHex.trim()) {
        // Recover from seed hex
        const success = parseSeed(seedHex);
        if (success) {
          setGenerated(true);
        } else {
          setError(hexError || 'Failed to parse seed');
          setIsLoading(false);
          return;
        }
      } else {
        setError(
          'Please enter a seed phrase, master seed (hex), entropy (hex), extended private key (xprv/yprv/zprv), or extended public key (xpub/ypub/zpub)'
        );
        setIsLoading(false);
        return;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to recover wallet');
      clearSeed();
      setGenerated(false);
      setRecoveredKeys([]);
    } finally {
      setIsLoading(false);
    }
  }, [
    extendedPrivateKey,
    extendedPublicKey,
    entropyHex,
    mnemonic,
    seedHex,
    network,
    derivationPath,
    addressCount,
    parseSeed,
    hexError,
    clearSeed,
    setGenerated,
    generateMnemonicFromEntropy,
    clearMnemonicFromEntropy,
  ]);

  // Clear hex seed and recovered keys when inputs change
  useEffect(() => {
    clearSeed();
    setRecoveredKeys([]);
    clearMnemonicFromEntropy();
    // Note: useGenerationFlag already resets isGenerated when dependencies change
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    mnemonic,
    seedHex,
    entropyHex,
    extendedPrivateKey,
    extendedPublicKey,
    passphrase,
    // Don't include clearSeed, clearMnemonicFromEntropy in deps
    // They are memoized with useCallback, but including them can cause issues
  ]);

  // Combine errors and loading states
  const { error: combinedError, isLoading: combinedIsLoading } =
    useCombinedAsyncState({
      localError: error || hexError || entropyError || '',
      localLoading: isLoading,
      asyncError: seedError,
      asyncLoading: isComputingSeedFromMnemonic || isGeneratingMnemonic,
    });

  return {
    mnemonic: effectiveMnemonic,
    seedHex,
    entropyHex,
    extendedPrivateKey,
    extendedPublicKey,
    passphrase,
    seed,
    entropy,
    keys,
    isLoading: combinedIsLoading,
    error: combinedError,
    setMnemonic,
    setSeedHex,
    setEntropyHex,
    setExtendedPrivateKey,
    setExtendedPublicKey,
    setPassphrase,
    handleRecover,
  };
}
