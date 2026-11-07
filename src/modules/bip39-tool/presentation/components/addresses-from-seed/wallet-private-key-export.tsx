import { useState } from 'react';

import { CopyButton } from '$/components/ui/copy-button';
import { FormSection } from '$/components/ui/form-section';
import { QRCodeButton } from '$/components/ui/qr-code-button';
import { RevealToggle } from '$/components/ui/reveal-toggle';
import { SecretDownloadButton } from '$/components/ui/secret-download-button';

import type { DerivedKey } from '../../../domain/bitcoin/config';
import { describeAccountPath } from '../../../lib/derivation';

interface WalletPrivateKeyExportProps {
  keys: DerivedKey[];
  derivationPath: string;
}

export function WalletPrivateKeyExport({
  keys,
  derivationPath,
}: WalletPrivateKeyExportProps) {
  const [isVisible, setIsVisible] = useState(false);

  // Get the extended private key from the first key
  const extendedKey = keys.length > 0 ? keys[0]?.xprv : null;

  if (!extendedKey) {
    return null;
  }

  // Detect the prefix (xprv/yprv/zprv) from the key string
  const prefix = extendedKey.startsWith('xprv')
    ? 'xprv'
    : extendedKey.startsWith('yprv')
      ? 'yprv'
      : extendedKey.startsWith('zprv')
        ? 'zprv'
        : extendedKey.startsWith('tprv')
          ? 'tprv'
          : extendedKey.startsWith('uprv')
            ? 'uprv'
            : extendedKey.startsWith('vprv')
              ? 'vprv'
              : 'xprv'; // Fallback

  const { scheme: pathName, networkLabel } =
    describeAccountPath(derivationPath);

  const buildFile = () => `Extended private key (${prefix})
Path: ${derivationPath} (${pathName}, account level)
Network: ${networkLabel}
First address: ${keys[0]?.address ?? 'n/a'}

${extendedKey}

This key derives every private key of this account. Anyone who has it can
spend all of the account's funds. Keep it offline and encrypted.

To import it, choose "extended private key" in a wallet such as BlueWallet
or Sparrow, paste the key, and check that the first address matches.

Saved: ${new Date().toISOString()}
`;

  return (
    <FormSection
      title={`Account private key (${prefix})`}
      description={`${pathName} account ${derivationPath}. It derives every private key of this account: whoever has it can spend everything.`}
      action={
        <>
          <RevealToggle
            revealed={isVisible}
            onToggle={() => setIsVisible((visible) => !visible)}
            subject="extended private key"
          />
          <CopyButton
            secret
            value={extendedKey}
            variant="outline"
            size="sm"
            label="Copy"
          />
          <QRCodeButton
            value={extendedKey}
            qrLabel={`Extended private key (${prefix})`}
            variant="outline"
            size="sm"
            showLabel
          />
          <SecretDownloadButton
            filename={() =>
              `${prefix}-${pathName.toLowerCase()}-${Date.now()}.txt`
            }
            content={buildFile}
            subject="the account private key"
          />
        </>
      }
    >
      <p
        className="rounded-lg bg-surface-inset px-3 py-2.5 font-mono text-xs
          break-all"
      >
        {isVisible ? extendedKey : '•'.repeat(48)}
      </p>
    </FormSection>
  );
}
