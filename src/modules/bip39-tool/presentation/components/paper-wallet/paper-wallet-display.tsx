import { useEffect, useState } from 'react';

import { renderQrSvg } from '@/shared/lib/qr';

import { CopyButton } from '$/components/ui/copy-button';
import { Disclosure } from '$/components/ui/disclosure';
import { RevealToggle } from '$/components/ui/reveal-toggle';

import type { PaperWallet } from '../../hooks/paper-wallet';

interface PaperWalletDisplayProps {
  wallet: PaperWallet;
}

function getAddressTypeLabel(path: string): string {
  if (path.includes("84'")) {
    return 'Native SegWit';
  }
  if (path.includes("49'")) {
    return 'P2SH-SegWit';
  }
  return 'Legacy';
}

export function PaperWalletDisplay({ wallet }: PaperWalletDisplayProps) {
  const [addressQR, setAddressQR] = useState<string | null>(null);
  const [privateKeyQR, setPrivateKeyQR] = useState<string | null>(null);
  const [isGeneratingQR, setIsGeneratingQR] = useState(true);
  const [seedVisible, setSeedVisible] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const generateQRs = async () => {
      setIsGeneratingQR(true);
      try {
        const privateKeyData =
          wallet.encryptedPrivateKey || wallet.privateKeyWIF;
        const [addressSvg, privateKeySvg] = await Promise.all([
          renderQrSvg(wallet.address),
          renderQrSvg(privateKeyData),
        ]);
        if (!cancelled) {
          setAddressQR(addressSvg);
          setPrivateKeyQR(privateKeySvg);
        }
      } catch (err) {
        console.error('Failed to generate QR codes:', err);
      } finally {
        if (!cancelled) {
          setIsGeneratingQR(false);
        }
      }
    };

    void generateQRs();

    return () => {
      cancelled = true;
    };
  }, [wallet]);

  const privateKeyDisplay = wallet.encryptedPrivateKey || wallet.privateKeyWIF;

  return (
    <div className="space-y-6">
      {/* Paper Wallet Layout */}
      <div
        className="rounded-xl border border-card-edge bg-card p-8 shadow-card
          print:border-0 print:p-4 print:shadow-none"
      >
        <div className="mb-8 text-center print:mb-4">
          <h2 className="text-2xl font-bold text-foreground print:text-xl">
            Bitcoin Paper Wallet
          </h2>
          <p className="mt-2 text-sm text-muted-foreground print:text-xs">
            Network: {wallet.network} | Type: {getAddressTypeLabel(wallet.path)}
          </p>
        </div>

        <div
          className="grid grid-cols-1 gap-8 md:grid-cols-2 print:grid-cols-2
            print:gap-4"
        >
          {/* RECEIVE */}
          <div className="space-y-4 text-center">
            <div>
              <h3
                className="mb-2 text-lg font-semibold text-success
                  print:text-base"
              >
                RECEIVE BITCOIN
              </h3>
              <p className="text-xs text-muted-foreground">
                Scan QR code or use address below
              </p>
            </div>

            {isGeneratingQR ? (
              <div
                className="flex h-[256px] items-center justify-center rounded
                  border border-border bg-muted/50"
              >
                <p className="text-sm text-muted-foreground">
                  Generating QR code...
                </p>
              </div>
            ) : addressQR ? (
              <div className="flex justify-center">
                <div
                  className="rounded border-2 border-border"
                  dangerouslySetInnerHTML={{ __html: addressQR }}
                />
              </div>
            ) : null}

            <div className="space-y-2">
              <div className="flex items-center justify-center gap-2">
                <p className="text-xs font-semibold text-foreground/80">
                  Bitcoin Address:
                </p>
                <CopyButton
                  value={wallet.address}
                  size="sm"
                  variant="ghost"
                  className="print:hidden"
                />
              </div>
              <p className="font-mono text-xs break-all text-foreground">
                {wallet.address}
              </p>
            </div>
          </div>

          {/* SPEND */}
          <div className="space-y-4 text-center">
            <div>
              <h3
                className="mb-2 text-lg font-semibold text-warning
                  print:text-base"
              >
                {wallet.encryptedPrivateKey
                  ? 'SPEND BITCOIN (ENCRYPTED)'
                  : 'SPEND BITCOIN (PRIVATE KEY)'}
              </h3>
              <p className="text-xs text-muted-foreground">
                {wallet.encryptedPrivateKey
                  ? 'Encrypted with BIP38, requires passphrase to decrypt'
                  : 'Scan QR code or use private key below'}
              </p>
            </div>

            {isGeneratingQR ? (
              <div
                className="flex h-[256px] items-center justify-center rounded
                  border border-border bg-muted/50"
              >
                <p className="text-sm text-muted-foreground">
                  Generating QR code...
                </p>
              </div>
            ) : privateKeyQR ? (
              <div className="flex justify-center">
                <div
                  className="rounded border-2 border-warning/25"
                  dangerouslySetInnerHTML={{ __html: privateKeyQR }}
                />
              </div>
            ) : null}

            <div className="space-y-2">
              <div className="flex items-center justify-center gap-2">
                <p className="text-xs font-semibold text-foreground/80">
                  {wallet.encryptedPrivateKey
                    ? 'Encrypted Private Key (BIP38):'
                    : 'Private Key (WIF):'}
                </p>
                <CopyButton
                  secret
                  value={privateKeyDisplay}
                  size="sm"
                  variant="ghost"
                  className="print:hidden"
                />
              </div>
              <p className="font-mono text-xs break-all text-foreground">
                {privateKeyDisplay}
              </p>
            </div>
          </div>
        </div>

        {wallet.encryptedPrivateKey && (
          <div
            className="mt-8 border-t border-border pt-6 print:mt-4 print:pt-4"
          >
            <p className="text-xs text-muted-foreground">
              <strong>Note:</strong> This private key is encrypted with BIP38.
              Remember your passphrase, store it separately from this wallet.
            </p>
          </div>
        )}
      </div>
      <Disclosure title="Technical details" className="print:hidden">
        <dl className="space-y-4">
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <dt className="text-label text-muted-foreground">
                Derivation path
              </dt>
              <CopyButton value={wallet.path} size="sm" variant="ghost" />
            </div>
            <dd
              className="rounded-lg bg-surface-inset px-3 py-2 font-mono
                text-sm"
            >
              {wallet.path}
            </dd>
          </div>
          <div className="space-y-1">
            <div className="flex items-center justify-between gap-2">
              <dt className="text-label text-warning">Root seed (hex)</dt>
              <div className="flex gap-1.5">
                <RevealToggle
                  revealed={seedVisible}
                  onToggle={() => setSeedVisible(!seedVisible)}
                  subject="root seed"
                />
                <CopyButton
                  secret
                  value={wallet.seedHex}
                  size="sm"
                  variant="outline"
                />
              </div>
            </div>
            <dd
              className="rounded-lg bg-surface-inset px-3 py-2 font-mono text-xs
                break-all"
            >
              {seedVisible ? wallet.seedHex : '•'.repeat(48)}
            </dd>
            <p className="text-xs text-muted-foreground">
              Only for advanced recovery: whoever has it derives every key. The
              encrypted key and the passphrase are enough to spend.
            </p>
          </div>
        </dl>
      </Disclosure>
    </div>
  );
}
