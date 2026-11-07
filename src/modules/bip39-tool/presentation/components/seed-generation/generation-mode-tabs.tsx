import { FormSection } from '$/components/ui/form-section';
import { Tabs, TabsList, TabsTrigger } from '$/components/ui/tabs';

import type { GenerationMode } from '../../../domain/bitcoin/config';

interface GenerationModeTabsProps {
  mode: GenerationMode;
  onModeChange: (mode: GenerationMode) => void;
}

export function GenerationModeTabs({
  mode,
  onModeChange,
}: GenerationModeTabsProps) {
  return (
    <FormSection
      title="Randomness"
      description={
        mode === 'random'
          ? "The browser's cryptographic random generator picks the words."
          : 'Your own entropy (dice, coins, collected sources) picks the words; the browser generator is not used.'
      }
    >
      <Tabs
        value={mode}
        onValueChange={(v) => onModeChange(v as GenerationMode)}
      >
        <TabsList aria-label="Randomness" className="grid w-full grid-cols-2">
          <TabsTrigger value="random">Browser random</TabsTrigger>
          <TabsTrigger value="custom">Your entropy</TabsTrigger>
        </TabsList>
      </Tabs>
    </FormSection>
  );
}
