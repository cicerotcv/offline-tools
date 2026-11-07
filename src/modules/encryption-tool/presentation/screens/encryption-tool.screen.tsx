import { useState } from 'react';

import { Card } from '@/shared/presentation/components/card';
import { PageContainer } from '@/shared/presentation/layouts/page';

import { Disclosure } from '$/components/ui/disclosure';

import { DecryptMode } from '../components/cipher/modes/decrypt-mode';
import { EncryptMode } from '../components/cipher/modes/encrypt-mode';
import { OperationModeTabs } from '../components/cipher/operation-mode-tabs';

type OperationMode = 'encrypt' | 'decrypt';

const COMPATIBLE = [
  ['Command line', 'gpg --decrypt file.gpg'],
  ['Desktop', 'Gpg4win (Windows), GPG Suite (macOS), Kleopatra'],
  ['Mobile', 'OpenKeychain (Android), PGPro (iOS)'],
] as const;

export function EncryptionToolScreen() {
  const [operationMode, setOperationMode] = useState<OperationMode>('encrypt');

  return (
    <PageContainer className="pt-0 sm:pt-0">
      <div className="space-y-6">
        <Card>
          <div className="space-y-6">
            <OperationModeTabs
              operationMode={operationMode}
              onOperationModeChange={setOperationMode}
            />

            {operationMode === 'encrypt' && <EncryptMode />}
            {operationMode === 'decrypt' && <DecryptMode />}
          </div>
        </Card>

        <Disclosure title="Open it with other OpenPGP tools">
          <div className="max-w-[75ch] space-y-3 text-sm text-muted-foreground">
            <p>
              Output is OpenPGP (RFC 4880) password encryption. Encrypted files
              use .gpg, armored text starts with -----BEGIN PGP MESSAGE-----,
              and the original file name is kept inside. To decrypt elsewhere
              you need only the message and the password:
            </p>
            <dl className="grid gap-2 sm:grid-cols-[9rem_1fr]">
              {COMPATIBLE.map(([where, what]) => (
                <div key={where} className="contents">
                  <dt className="font-medium text-foreground">{where}</dt>
                  <dd className="font-mono text-xs leading-5">{what}</dd>
                </div>
              ))}
            </dl>
          </div>
        </Disclosure>
      </div>
    </PageContainer>
  );
}
