import { useState } from 'react';

import { Card } from '@/shared/presentation/components/card';

import { useTinySeedWords } from '../../hooks/tiny-seed-words';
import { SeedPhraseInput } from '../shared/seed-phrase-input';
import { MnemonicStatusPanel } from '../tiny-seed/mnemonic-status-panel';

/** Checks the phrase as it is typed: unknown words, length and checksum. */
export function SeedValidationForm() {
  const [mnemonic, setMnemonic] = useState('');
  const analysis = useTinySeedWords(mnemonic);

  return (
    <Card>
      <div className="space-y-5">
        <SeedPhraseInput
          id="mnemonic"
          value={mnemonic}
          onChange={setMnemonic}
        />
        <MnemonicStatusPanel
          wordCount={analysis.wordCount}
          wordCountStatus={analysis.wordCountStatus}
          checksumStatus={analysis.checksumStatus}
          invalidWords={analysis.invalidWords}
          mnemonic={analysis.mnemonic}
          linkToValidation={false}
          allowCopy={false}
        />
      </div>
    </Card>
  );
}
