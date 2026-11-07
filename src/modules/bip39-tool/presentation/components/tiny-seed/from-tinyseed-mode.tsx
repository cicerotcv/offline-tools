import { useEffect, useMemo, useState } from 'react';

import { Button } from '$/components/ui/button';
import { FormSection } from '$/components/ui/form-section';

import type { WordCount } from '../../../domain/bitcoin/config';
import { binaryToWord } from '../../../lib/wordlist';
import { analyzeTinySeedWords } from '../../hooks/tiny-seed-words';
import { WordCountSelector } from '../seed-generation/word-count-selector';
import { InteractiveBitGrid } from '../visualization/interactive-bit-grid/interactive-bit-grid';
import { MnemonicStatusPanel } from './mnemonic-status-panel';

function resolveWordsFromBits(bits: boolean[][]): string[] {
  return bits.map((wordBits) => {
    const binary = wordBits.map((bit) => (bit ? '1' : '0')).join('');
    try {
      const word = binaryToWord(binary);
      return word ?? 'INVALID';
    } catch {
      return 'INVALID';
    }
  });
}

export function FromTinySeedMode() {
  const [numWords, setNumWords] = useState<WordCount>(12);
  const [bits, setBits] = useState<boolean[][]>(() =>
    Array(12)
      .fill(null)
      .map(() => Array(11).fill(false))
  );

  useEffect(() => {
    setBits((prevBits) => {
      if (prevBits.length === numWords) {
        return prevBits;
      }
      return Array(numWords)
        .fill(null)
        .map((_, idx) => {
          if (idx < prevBits.length) {
            return prevBits[idx];
          }
          return Array(11).fill(false);
        });
    });
  }, [numWords]);

  const handleBitToggle = (wordIdx: number, bitIdx: number) => {
    setBits((prevBits) => {
      const newBits = prevBits.map((wordBits, idx) => {
        if (idx === wordIdx) {
          return wordBits.map((bit, bIdx) => (bIdx === bitIdx ? !bit : bit));
        }
        return wordBits;
      });
      return newBits;
    });
  };

  const derivedWords = useMemo(() => resolveWordsFromBits(bits), [bits]);
  const analysis = useMemo(
    () => analyzeTinySeedWords(derivedWords),
    [derivedWords]
  );

  const handleClearAll = () => {
    setBits(
      Array(numWords)
        .fill(null)
        .map(() => Array(11).fill(false))
    );
  };

  return (
    <div className="space-y-4">
      <WordCountSelector wordCount={numWords} onWordCountChange={setNumWords} />

      <MnemonicStatusPanel
        wordCount={analysis.wordCount}
        wordCountStatus={analysis.wordCountStatus}
        checksumStatus={analysis.checksumStatus}
        invalidWords={analysis.invalidWords}
        mnemonic={analysis.mnemonic}
      />

      <FormSection
        title="Grid"
        description="Mark the bits punched on each row of the plate."
        action={
          <Button onClick={handleClearAll} variant="ghost" size="sm">
            Clear
          </Button>
        }
      >
        <div className="w-full overflow-x-auto rounded-lg bg-surface-inset p-4">
          <InteractiveBitGrid
            numWords={numWords}
            bits={bits}
            onBitToggle={handleBitToggle}
          />
        </div>
      </FormSection>
    </div>
  );
}
