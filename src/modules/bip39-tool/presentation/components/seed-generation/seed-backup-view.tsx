import { useState } from 'react';

import { Download, QrCode } from 'lucide-react';

import { renderQrDataUrl } from '@/shared/lib/qr';

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
import { CopyButton } from '$/components/ui/copy-button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '$/components/ui/dialog';
import { Disclosure } from '$/components/ui/disclosure';
import { FormSection } from '$/components/ui/form-section';
import { RevealToggle } from '$/components/ui/reveal-toggle';
import { downloadText } from '$/lib/download';

interface SeedBackupViewProps {
  mnemonic: string;
  passphrase: string;
  wordCount: number;
}

function downloadSeedBackup(content: string, wordCount: number) {
  downloadText(`seed-backup-${wordCount}-words-${Date.now()}.txt`, content);
}

export function SeedBackupView({
  mnemonic,
  passphrase,
  wordCount,
}: SeedBackupViewProps) {
  const [isMnemonicVisible, setIsMnemonicVisible] = useState(false);
  const [isPassphraseVisible, setIsPassphraseVisible] = useState(false);
  const [qrDialogOpen, setQrDialogOpen] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [downloadConfirmOpen, setDownloadConfirmOpen] = useState(false);
  const [qrConfirmOpen, setQrConfirmOpen] = useState(false);

  const words = mnemonic.split(/\s+/);
  const hasPassphrase = passphrase.trim().length > 0;

  const buildBackupContent = () => {
    return `BITCOIN SEED PHRASE BACKUP
Generated: ${new Date().toLocaleString()}

================================================================================
IMPORTANT: KEEP THIS SECURE
================================================================================

This document contains your seed phrase. Anyone with access to this can
control your funds. Store it securely offline.

================================================================================
SEED PHRASE (${wordCount} WORDS)
================================================================================

${words.map((word, i) => `${String(i + 1).padStart(2, '0')}. ${word}`).join('\n')}

${hasPassphrase ? `\n================================================================================\nPASSPHRASE\n================================================================================\n\n${passphrase}\n\nCRITICAL: You MUST remember this passphrase. It cannot be recovered!\nThe seed phrase alone is NOT sufficient if you used a passphrase.\n` : '\nNo passphrase was used.\n'}

================================================================================
RECOVERY INSTRUCTIONS
================================================================================

To recover your wallet:

1. Open a BIP39-compatible wallet (Blue Wallet, Electrum, etc.)
2. Select "Import" or "Restore Wallet"
3. Choose "${wordCount}-word" seed phrase
4. Enter the ${wordCount} words above in order${hasPassphrase ? '\n5. When prompted, enter your passphrase' : ''}
6. Your wallet will be restored

================================================================================
SECURITY REMINDERS
================================================================================

- Never share your seed phrase or passphrase with anyone
- Store this document in a secure, offline location
- Avoid cloud storage, email, and screenshots
- Test your backup by restoring it in a test wallet before storing funds
${hasPassphrase ? '- Remember your passphrase - it cannot be recovered if forgotten' : ''}

================================================================================
`;
  };

  const handleDownloadBackup = () => {
    downloadSeedBackup(buildBackupContent(), wordCount);
    setDownloadConfirmOpen(false);
  };

  const handleShowQR = () => {
    setQrConfirmOpen(false);
    setQrDialogOpen(true);
    renderQrDataUrl(mnemonic, { width: 400 })
      .then((url) => {
        setQrDataUrl(url);
      })
      .catch(() => {
        setQrDataUrl(null);
      });
  };

  return (
    <div className="space-y-6">
      <FormSection
        title={`Seed phrase, ${wordCount} words`}
        description="Write the words in order on paper or metal. Anyone who sees them controls the funds, so no photos, cloud or email."
        action={
          <>
            <RevealToggle
              revealed={isMnemonicVisible}
              onToggle={() => setIsMnemonicVisible(!isMnemonicVisible)}
              subject="seed phrase"
            />
            <CopyButton secret value={mnemonic} size="sm" variant="outline" />
          </>
        }
      >
        <ol
          aria-label={isMnemonicVisible ? 'Seed words' : 'Seed words, hidden'}
          className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4"
        >
          {words.map((word, index) => (
            <li
              key={index}
              className="flex items-baseline gap-2 rounded-md bg-surface-inset
                px-3 py-2"
            >
              <span
                className="w-5 shrink-0 font-mono text-xs text-muted-foreground
                  select-none"
              >
                {String(index + 1).padStart(2, '0')}
              </span>
              <span className="font-mono text-sm font-medium break-all">
                {isMnemonicVisible ? word : '•••••'}
              </span>
            </li>
          ))}
        </ol>
      </FormSection>

      {hasPassphrase && (
        <FormSection
          title="Passphrase"
          description="The words alone do not restore this wallet: you need the words and this passphrase. It cannot be recovered."
          action={
            <>
              <RevealToggle
                revealed={isPassphraseVisible}
                onToggle={() => setIsPassphraseVisible(!isPassphraseVisible)}
                subject="passphrase"
              />
              <CopyButton
                secret
                value={passphrase}
                size="sm"
                variant="outline"
              />
            </>
          }
        >
          <p
            className="rounded-md bg-surface-inset px-3 py-2 font-mono text-sm
              break-all"
          >
            {isPassphraseVisible ? passphrase : '•'.repeat(12)}
          </p>
        </FormSection>
      )}

      <Disclosure title="Other ways to export">
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground">
            Both put the seed on a screen or a disk. Prefer paper.
          </p>
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setQrConfirmOpen(true)}
            >
              <QrCode aria-hidden className="h-4 w-4" />
              Show as QR code
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setDownloadConfirmOpen(true)}
            >
              <Download aria-hidden className="h-4 w-4" />
              Download text file
            </Button>
          </div>
        </div>
      </Disclosure>

      <AlertDialog
        open={downloadConfirmOpen}
        onOpenChange={setDownloadConfirmOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Download seed backup?</AlertDialogTitle>
            <AlertDialogDescription>
              This creates a plain-text file on your device. Only save it to
              secure offline storage. Avoid cloud sync, email, and shared
              folders.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDownloadBackup}>
              Download
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={qrConfirmOpen} onOpenChange={setQrConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Show QR code?</AlertDialogTitle>
            <AlertDialogDescription>
              QR codes encode your full seed phrase. Only use this in a trusted,
              offline environment. Never display publicly or scan with untrusted
              apps.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleShowQR}>
              Show QR code
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={qrDialogOpen} onOpenChange={setQrDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Seed Phrase QR Code</DialogTitle>
            <DialogDescription>
              Scan only in a trusted, offline wallet app
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {qrDataUrl ? (
              <div className="flex justify-center">
                <img
                  src={qrDataUrl}
                  alt="Seed phrase QR code"
                  className="rounded-lg border border-border p-2"
                />
              </div>
            ) : (
              <div className="flex h-64 items-center justify-center">
                <p className="text-sm text-muted-foreground">
                  Generating QR code...
                </p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
