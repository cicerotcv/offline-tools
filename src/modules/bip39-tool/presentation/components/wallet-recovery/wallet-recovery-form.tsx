import { useEffect, useState } from 'react';

import { Key } from 'lucide-react';

import { Card } from '@/shared/presentation/components/card';

import { Alert } from '$/components/ui/alert';
import { Button } from '$/components/ui/button';
import { AdvancedOptions } from '$/components/ui/disclosure';
import { FormSection } from '$/components/ui/form-section';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '$/components/ui/tabs';

import { ExtendedKeyParser } from '../../../lib/derivation';
import { useDerivationConfig } from '../../hooks/derivation-config';
import { useWalletRecovery } from '../../hooks/wallet-recovery';
import { DerivationPanel } from '../addresses-from-seed/derivation-panel';
import { AutocompleteTextarea } from '../shared/autocomplete-textarea';
import { PassphraseInput } from '../shared/passphrase-input';
import { SeedPhraseInput } from '../shared/seed-phrase-input';

type InputMode =
  | 'mnemonic'
  | 'seed'
  | 'entropy'
  | 'extendedPrivate'
  | 'extendedPublic';
type Source = 'mnemonic' | 'extended' | 'raw';
type RawKind = 'seed' | 'entropy';

const PUBLIC_PREFIX = /^[xyztuv]pub/i;

export function WalletRecoveryForm() {
  const [source, setSource] = useState<Source>('mnemonic');
  const [rawKind, setRawKind] = useState<RawKind>('seed');
  const [extendedKey, setExtendedKey] = useState('');

  // Derivation configuration (managed by form)
  const derivationConfig = useDerivationConfig();
  const {
    network,
    derivationPath,
    addressCount,
    setNetwork,
    setDerivationPath,
    setAddressCount,
  } = derivationConfig;

  // Wallet recovery hook (takes config as input)
  const {
    mnemonic,
    seedHex,
    entropyHex,
    extendedPrivateKey,
    extendedPublicKey,
    passphrase,
    keys,
    seed,
    entropy,
    isLoading,
    error,
    setMnemonic,
    setSeedHex,
    setEntropyHex,
    setExtendedPrivateKey,
    setExtendedPublicKey,
    setPassphrase,
    handleRecover,
  } = useWalletRecovery({
    network,
    derivationPath,
    addressCount,
  });

  const isPublicKey = PUBLIC_PREFIX.test(extendedKey.trim());
  const inputMode: InputMode =
    source === 'mnemonic'
      ? 'mnemonic'
      : source === 'raw'
        ? rawKind
        : isPublicKey
          ? 'extendedPublic'
          : 'extendedPrivate';

  /*
   * The recovery hook uses whichever field is filled, so switching source
   * clears the others: the visible input is always the one that is used,
   * and no secret lingers in a hidden tab.
   */
  const clearInputs = () => {
    setMnemonic('');
    setSeedHex('');
    setEntropyHex('');
    setExtendedKey('');
    setExtendedPrivateKey('');
    setExtendedPublicKey('');
  };

  const handleExtendedKeyChange = (value: string) => {
    setExtendedKey(value);
    if (PUBLIC_PREFIX.test(value.trim())) {
      setExtendedPublicKey(value);
      setExtendedPrivateKey('');
    } else {
      setExtendedPrivateKey(value);
      setExtendedPublicKey('');
    }
  };

  // Auto-detect derivation path and network from extended public key
  useEffect(() => {
    if (inputMode === 'extendedPublic' && extendedPublicKey.trim()) {
      const detectedPath =
        ExtendedKeyParser.detectDerivationPath(extendedPublicKey);
      const detectedNetwork =
        ExtendedKeyParser.detectNetwork(extendedPublicKey);

      if (detectedPath && detectedPath !== derivationPath) {
        setDerivationPath(detectedPath);
      }

      if (detectedNetwork && detectedNetwork !== network) {
        setNetwork(detectedNetwork);
      }
    }
  }, [
    extendedPublicKey,
    inputMode,
    derivationPath,
    network,
    setDerivationPath,
    setNetwork,
  ]);

  // Auto-detect network from extended private key
  useEffect(() => {
    if (inputMode === 'extendedPrivate' && extendedPrivateKey.trim()) {
      const detectedNetwork =
        ExtendedKeyParser.detectNetwork(extendedPrivateKey);
      if (detectedNetwork && detectedNetwork !== network) {
        setNetwork(detectedNetwork);
      }
    }
  }, [extendedPrivateKey, inputMode, network, setNetwork]);

  // Check if derivation path should be disabled (watch-only wallet)
  const isWatchOnlyWallet =
    inputMode === 'extendedPublic' && extendedPublicKey.trim() !== '';
  const detectedPathForWatchOnly = isWatchOnlyWallet
    ? ExtendedKeyParser.detectDerivationPath(extendedPublicKey)
    : null;

  // Check if network should be disabled (determined by key format)
  const isNetworkFromKey =
    (inputMode === 'extendedPublic' && extendedPublicKey.trim() !== '') ||
    (inputMode === 'extendedPrivate' && extendedPrivateKey.trim() !== '');

  const isEmpty =
    (source === 'mnemonic' && !mnemonic.trim()) ||
    (source === 'extended' && !extendedKey.trim()) ||
    (source === 'raw' && rawKind === 'seed' && !seedHex.trim()) ||
    (source === 'raw' && rawKind === 'entropy' && !entropyHex.trim());

  return (
    <div className="space-y-6">
      <Card className="space-y-6">
        <Tabs
          value={source}
          onValueChange={(v) => {
            clearInputs();
            setSource(v as Source);
          }}
        >
          <TabsList aria-label="Start from" className="grid w-full grid-cols-3">
            <TabsTrigger value="mnemonic">Seed phrase</TabsTrigger>
            <TabsTrigger value="extended">Extended key</TabsTrigger>
            <TabsTrigger value="raw">Raw hex</TabsTrigger>
          </TabsList>

          <TabsContent value="mnemonic" className="mt-5">
            <SeedPhraseInput
              id="mnemonic"
              value={mnemonic}
              onChange={setMnemonic}
            />
          </TabsContent>

          <TabsContent value="extended" className="mt-5">
            <FormSection
              title="Extended key"
              htmlFor="extended-key"
              description={
                extendedKey.trim()
                  ? isPublicKey
                    ? 'Public key: watch-only, addresses without private keys.'
                    : 'Private key: addresses and their private keys.'
                  : 'An account-level xprv, yprv, zprv, or xpub, ypub, zpub. The prefix sets the address type.'
              }
            >
              <AutocompleteTextarea
                id="extended-key"
                value={extendedKey}
                onChange={handleExtendedKeyChange}
                className="min-h-28 font-mono text-sm"
              />
            </FormSection>
          </TabsContent>

          <TabsContent value="raw" className="mt-5 space-y-4">
            <Tabs
              value={rawKind}
              onValueChange={(v) => {
                clearInputs();
                setRawKind(v as RawKind);
              }}
            >
              <TabsList aria-label="Raw input">
                <TabsTrigger value="seed" className="px-4">
                  Master seed
                </TabsTrigger>
                <TabsTrigger value="entropy" className="px-4">
                  Entropy
                </TabsTrigger>
              </TabsList>
            </Tabs>
            {rawKind === 'seed' ? (
              <FormSection
                title="Master seed (hex)"
                htmlFor="seed"
                description="128 hex characters (64 bytes). A passphrase does not apply to a raw seed."
              >
                <AutocompleteTextarea
                  id="seed"
                  value={seedHex}
                  onChange={setSeedHex}
                  className="min-h-28 font-mono text-sm"
                />
              </FormSection>
            ) : (
              <FormSection
                title="Entropy (hex)"
                htmlFor="entropy"
                description="The entropy behind the phrase: 32 to 64 hex characters (12 to 24 words)."
              >
                <AutocompleteTextarea
                  id="entropy"
                  value={entropyHex}
                  onChange={setEntropyHex}
                  className="min-h-28 font-mono text-sm"
                />
              </FormSection>
            )}
          </TabsContent>
        </Tabs>

        {(inputMode === 'mnemonic' || inputMode === 'entropy') && (
          <AdvancedOptions>
            <PassphraseInput
              passphrase={passphrase}
              onPassphraseChange={setPassphrase}
              description="Only if the wallet uses one. A wrong passphrase still gives valid-looking addresses, so compare them with your wallet."
            />
          </AdvancedOptions>
        )}

        <Button
          onClick={handleRecover}
          disabled={isLoading || isEmpty}
          className="w-full"
          size="lg"
        >
          <Key aria-hidden className="h-4 w-4" />
          {isLoading ? 'Deriving…' : 'Derive addresses'}
        </Button>

        {error && <Alert variant="error">{error}</Alert>}
      </Card>

      {keys.length > 0 && (
        <Card className="space-y-6">
          {(seed || entropy) && (
            <dl
              className="grid gap-x-6 gap-y-2 text-sm sm:grid-cols-[10rem_1fr]"
            >
              {mnemonic && (
                <>
                  <dt className="text-muted-foreground">Seed phrase</dt>
                  <dd className="font-mono">
                    {mnemonic.split(' ').length} words
                  </dd>
                </>
              )}
              {entropy && (
                <>
                  <dt className="text-muted-foreground">Entropy</dt>
                  <dd className="font-mono text-xs break-all">{entropy}</dd>
                </>
              )}
              {seed && (
                <>
                  <dt className="text-muted-foreground">Master seed</dt>
                  <dd className="font-mono text-xs break-all">{seed}</dd>
                </>
              )}
              {passphrase && (
                <>
                  <dt className="text-muted-foreground">Passphrase</dt>
                  <dd className="font-mono text-xs">
                    {'•'.repeat(Math.min(passphrase.length, 16))} (
                    {passphrase.length} characters)
                  </dd>
                </>
              )}
            </dl>
          )}

          <DerivationPanel
            network={network}
            derivationPath={derivationPath}
            addressCount={addressCount}
            keys={keys}
            isLoading={isLoading}
            onNetworkChange={setNetwork}
            onPathChange={setDerivationPath}
            onCountChange={setAddressCount}
            networkLockedReason={
              isNetworkFromKey
                ? 'The network comes from the extended key prefix.'
                : undefined
            }
            pathLockedReason={
              isWatchOnlyWallet
                ? `The path is ${detectedPathForWatchOnly?.toUpperCase()}, set by the ${extendedPublicKey.trim().substring(0, 4)} prefix of the extended public key.`
                : undefined
            }
          />
        </Card>
      )}
    </div>
  );
}
