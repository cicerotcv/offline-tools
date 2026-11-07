import { useState } from 'react';

import { Key } from 'lucide-react';

import { Alert } from '$/components/ui/alert';
import { Button } from '$/components/ui/button';

import type { BitcoinNetwork as Network } from '../../../domain/bitcoin/network';
import { DEFAULT_NETWORK } from '../../../lib/networks';
import type { AddressType } from '../../hooks/paper-wallet';
import { NetworkSelector } from '../addresses-from-seed/network-selector';
import { PassphraseInput } from '../shared/passphrase-input';
import { AddressTypeSelector } from './address-type-selector';

interface PaperWalletConfigCardProps {
  onGenerate: (
    network: Network,
    addressType: AddressType,
    passphrase: string
  ) => Promise<void>;
  isGenerating: boolean;
  error: string | null;
  disabled?: boolean;
}

export function PaperWalletConfigCard({
  onGenerate,
  isGenerating,
  error,
  disabled = false,
}: PaperWalletConfigCardProps) {
  const [network, setNetwork] = useState<Network>(DEFAULT_NETWORK.network);
  const [addressType, setAddressType] = useState<AddressType>('native');
  const [passphrase, setPassphrase] = useState('');
  const [passphraseConfirm, setPassphraseConfirm] = useState('');

  const passphraseMismatch =
    passphraseConfirm.length > 0 && passphrase !== passphraseConfirm;

  const canGenerate =
    passphrase.trim().length > 0 &&
    passphrase === passphraseConfirm &&
    !isGenerating &&
    !disabled;

  const handleGenerate = () => {
    void onGenerate(network, addressType, passphrase);
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <NetworkSelector
          network={network}
          onNetworkChange={setNetwork}
          disabled={disabled || isGenerating}
        />
        <AddressTypeSelector
          value={addressType}
          onChange={setAddressType}
          disabled={disabled || isGenerating}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <PassphraseInput
          id="passphrase"
          passphrase={passphrase}
          onPassphraseChange={setPassphrase}
          description="Encrypts the printed key (BIP38). Without it the paper cannot spend, and it cannot be recovered."
        />
        <div className="space-y-1.5">
          <PassphraseInput
            id="passphrase-confirm"
            label="Confirm passphrase"
            passphrase={passphraseConfirm}
            onPassphraseChange={setPassphraseConfirm}
            description="Keep it apart from the paper."
          />
          {passphraseMismatch && (
            <p role="alert" className="text-xs text-destructive">
              The passphrases do not match.
            </p>
          )}
        </div>
      </div>

      {error && <Alert variant="error">{error}</Alert>}

      <Button
        onClick={handleGenerate}
        disabled={!canGenerate}
        loading={isGenerating}
        className="w-full"
        size="lg"
      >
        <Key aria-hidden className="h-4 w-4" />
        {isGenerating ? 'Encrypting the key…' : 'Generate paper wallet'}
      </Button>
    </div>
  );
}
