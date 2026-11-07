import { Download } from 'lucide-react';

import { Button } from '$/components/ui/button';
import { CopyButton } from '$/components/ui/copy-button';
import { FormSection } from '$/components/ui/form-section';
import { QRCodeButton } from '$/components/ui/qr-code-button';
import { downloadText } from '$/lib/download';

import type { DerivedKey } from '../../../domain/bitcoin/config';
import { describeAccountPath } from '../../../lib/derivation';

interface WalletPublicKeyExportProps {
  keys: DerivedKey[];
  derivationPath: string;
}

export function WalletPublicKeyExport({
  keys,
  derivationPath,
}: WalletPublicKeyExportProps) {
  // Get the extended public key from the first key (all keys in the same derivation path share the same account-level key)
  const extendedKey = keys.length > 0 ? keys[0]?.xpub : null;

  if (!extendedKey) {
    return null;
  }

  // Detect the prefix (xpub/ypub/zpub) from the key string
  const prefix = extendedKey.startsWith('xpub')
    ? 'xpub'
    : extendedKey.startsWith('ypub')
      ? 'ypub'
      : extendedKey.startsWith('zpub')
        ? 'zpub'
        : extendedKey.startsWith('tpub')
          ? 'tpub'
          : extendedKey.startsWith('upub')
            ? 'upub'
            : extendedKey.startsWith('vpub')
              ? 'vpub'
              : 'xpub'; // Fallback

  const { scheme: pathName, networkLabel } =
    describeAccountPath(derivationPath);

  const handleDownload = () => {
    const content = `Extended Public Key (${prefix.toUpperCase()})
Derivation Path: ${derivationPath} (${pathName} - Account Level)
Network: ${networkLabel}

${extendedKey}

================================================================================
BLUE WALLET IMPORT INSTRUCTIONS
================================================================================

IMPORT STEPS FOR BLUE WALLET:
1. Open Blue Wallet
2. Tap "+" or "Add Wallet"
3. Select "Import" or "Watch-only"
4. Choose "Extended Public Key (${prefix.toUpperCase()})"
5. Paste this ${prefix.toUpperCase()}: ${extendedKey}
6. Verify the first address matches: ${keys[0]?.address || 'N/A'}

If the addresses don't match, you selected the wrong derivation path.

================================================================================

This extended public key is at the account level and can be imported into
watch-only wallets like Blue Wallet to monitor addresses without exposing
private keys.

IMPORTANT: This is a PUBLIC key only. It is safe to share and allows:
- Viewing addresses and transaction history
- Receiving funds
- Creating watch-only wallets

It does NOT allow:
- Spending funds
- Accessing private keys

Generated: ${new Date().toISOString()}`;

    downloadText(
      `${prefix}-${pathName.toLowerCase()}-${Date.now()}.txt`,
      content
    );
  };

  return (
    <FormSection
      title={`Account public key (${prefix})`}
      description="Watch-only: it shows every address and balance of the account but cannot spend. Share it only with software you trust, for privacy."
      action={
        <>
          <CopyButton
            value={extendedKey}
            variant="outline"
            size="sm"
            label="Copy"
          />
          <QRCodeButton
            value={extendedKey}
            qrLabel={`Extended public key (${prefix})`}
            variant="outline"
            size="sm"
            showLabel
          />
          <Button variant="outline" size="sm" onClick={handleDownload}>
            <Download aria-hidden className="h-4 w-4" />
            Download
          </Button>
        </>
      }
    >
      <p
        className="rounded-lg bg-surface-inset px-3 py-2.5 font-mono text-xs
          break-all"
      >
        {extendedKey}
      </p>
    </FormSection>
  );
}
