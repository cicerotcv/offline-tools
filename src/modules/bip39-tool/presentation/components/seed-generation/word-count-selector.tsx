import { FormSection } from '$/components/ui/form-section';
import { Tabs, TabsList, TabsTrigger } from '$/components/ui/tabs';

import type { WordCount } from '../../../domain/bitcoin/config';
import {
  getWordCountConfig,
  VALID_WORD_COUNTS,
} from '../../../domain/mnemonic/word-counts';

interface WordCountSelectorProps {
  wordCount: WordCount;
  onWordCountChange: (count: WordCount) => void;
}

export function WordCountSelector({
  wordCount,
  onWordCountChange,
}: WordCountSelectorProps) {
  const config = getWordCountConfig(wordCount);
  return (
    <FormSection
      title="Words"
      description={`${config.entropyBits} bits of entropy. 12 words is the common choice; 24 is the maximum.`}
    >
      <Tabs
        value={String(wordCount)}
        onValueChange={(v) => onWordCountChange(Number(v) as WordCount)}
      >
        <TabsList aria-label="Words" className="grid w-full grid-cols-5">
          {VALID_WORD_COUNTS.map((count) => (
            <TabsTrigger
              key={count}
              value={String(count)}
              className="font-mono"
            >
              {count}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>
    </FormSection>
  );
}
