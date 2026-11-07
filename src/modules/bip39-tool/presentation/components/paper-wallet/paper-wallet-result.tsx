import { useState } from 'react';

import { Printer, RefreshCw } from 'lucide-react';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '$/components/ui/alert-dialog';
import { Button } from '$/components/ui/button';
import { SecretDownloadButton } from '$/components/ui/secret-download-button';

import type { PaperWallet } from '../../hooks/paper-wallet';
import { PaperWalletDisplay } from './paper-wallet-display';

interface PaperWalletResultProps {
  wallet: PaperWallet;
  onGenerateNew: () => void;
}

export function PaperWalletResult({
  wallet,
  onGenerateNew,
}: PaperWalletResultProps) {
  const [confirmNew, setConfirmNew] = useState(false);

  const handlePrint = () => {
    window.print();
  };

  const buildFile = () => {
    const content = `Bitcoin Paper Wallet
Generated: ${new Date().toISOString()}
Network: ${wallet.network}
Derivation Path: ${wallet.path}

================================================================================
ADVANCED, WALLET SEED (KEEP SECURE)
================================================================================

Seed (Hex):
${wallet.seedHex}

WARNING: This is the root seed used to generate this wallet.
Anyone with access to this seed can derive all keys and addresses.
Keep this secure and never share it with anyone.

================================================================================
RECEIVE BITCOIN
================================================================================

Address:
${wallet.address}

================================================================================
SPEND BITCOIN (ENCRYPTED PRIVATE KEY)
================================================================================

${
  wallet.encryptedPrivateKey
    ? `Encrypted Private Key (BIP38):
${wallet.encryptedPrivateKey}

IMPORTANT: This private key is encrypted with BIP38.
You MUST remember your passphrase to decrypt and spend funds.

WARNING: If you lose your passphrase, you CANNOT recover your funds!
`
    : `Private Key (WIF):
${wallet.privateKeyWIF}

WARNING: This is an UNENCRYPTED private key.
Keep this secure and never share it with anyone!
`
}

================================================================================
SECURITY NOTES
================================================================================

1. Store this paper wallet in a secure, waterproof, and fireproof location
2. ${
      wallet.encryptedPrivateKey
        ? 'Remember your passphrase, store it separately from this wallet'
        : 'Keep this private key secure, anyone with access can spend your funds'
    }
3. Test importing the private key before sending funds
4. Start with a small test amount before sending larger funds
5. Verify the address before sending Bitcoin
`;

    return content;
  };

  return (
    <div className="space-y-6">
      <div
        className="flex flex-wrap items-center justify-between gap-3
          print:hidden"
      >
        <p className="text-sm text-muted-foreground">
          The key is BIP38-encrypted and was checked against the address. Print
          it on a printer that is not on a network.
        </p>
        <div className="flex flex-wrap gap-2">
          <Button onClick={handlePrint}>
            <Printer aria-hidden className="h-4 w-4" />
            Print
          </Button>
          <SecretDownloadButton
            filename={() =>
              `paper-wallet-${wallet.address.slice(0, 10)}-${Date.now()}.txt`
            }
            content={buildFile}
            subject="the paper wallet"
            size="default"
          />
          <Button variant="outline" onClick={() => setConfirmNew(true)}>
            <RefreshCw aria-hidden className="h-4 w-4" />
            New wallet
          </Button>
        </div>
      </div>

      <PaperWalletDisplay wallet={wallet} />

      <AlertDialog open={confirmNew} onOpenChange={setConfirmNew}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Discard this wallet?</AlertDialogTitle>
            <AlertDialogDescription>
              Its keys are not stored anywhere. If you have not printed or saved
              it, it is gone for good.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep it</AlertDialogCancel>
            <AlertDialogAction onClick={onGenerateNew}>
              Discard
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
