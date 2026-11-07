import { useMemo } from 'react';

import { useDebounceState } from '@/shared/presentation/hooks/debounce-state';

import { CopyButton } from '$/components/ui/copy-button';
import { FormSection } from '$/components/ui/form-section';

import { indexToBinary } from '../../../lib/wordlist';
import { useTinySeedWords } from '../../hooks/tiny-seed-words';
import { SeedPhraseInput } from '../shared/seed-phrase-input';
import { BitGrid } from '../visualization/bit-grid/bit-grid';
import { MnemonicStatusPanel } from './mnemonic-status-panel';

export function FromWordsMode() {
  const [input, setInput, debouncedInput] = useDebounceState('', 300);
  const analysis = useTinySeedWords(debouncedInput);

  const binaryString = useMemo(() => {
    if (analysis.indexes.length === 0) {
      return '';
    }

    return analysis.indexes
      .map((index) => {
        if (index === null) {
          return '?'.repeat(11);
        }
        return indexToBinary(index, 11);
      })
      .join('');
  }, [analysis.indexes]);

  return (
    <div className="space-y-4">
      <SeedPhraseInput
        id="word-input"
        label="Words"
        value={input}
        onChange={setInput}
        helpText="Space or one per line."
      />

      <MnemonicStatusPanel
        wordCount={analysis.wordCount}
        wordCountStatus={analysis.wordCountStatus}
        checksumStatus={analysis.checksumStatus}
        invalidWords={analysis.invalidWords}
        mnemonic={analysis.mnemonic}
      />

      {analysis.words.length > 0 && (
        <FormSection
          title="Grid, 11 bits per word"
          action={
            binaryString && (
              <CopyButton
                secret
                value={binaryString}
                variant="outline"
                size="sm"
                label="Copy bits"
              />
            )
          }
        >
          <div
            className="w-full overflow-x-auto rounded-lg bg-surface-inset p-4"
          >
            <BitGrid words={analysis.words} indexes={analysis.indexes} />
          </div>
        </FormSection>
      )}
    </div>
  );
}
