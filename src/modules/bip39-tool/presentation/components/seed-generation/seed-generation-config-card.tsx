import { useState } from 'react';

import { zodResolver } from '@hookform/resolvers/zod';
import { Key } from 'lucide-react';
import { useForm } from 'react-hook-form';
import type { z } from 'zod';

import { Card } from '@/shared/presentation/components/card';
import { MouseEntropyCollector } from '@/shared/presentation/components/mouse-entropy-collector';

import { Alert } from '$/components/ui/alert';
import { Button } from '$/components/ui/button';
import { AdvancedOptions } from '$/components/ui/disclosure';

import { seedGenerationSchema } from '../../../application/seed-generation.schema';
import type { GenerationMode, WordCount } from '../../../domain/bitcoin/config';
import type { GenerateParams } from '../../hooks/mnemonic-generation';
import { PassphraseInput } from '../shared/passphrase-input';
import { EntropyInputSection } from './entropy-input-section';
import { GenerationModeTabs } from './generation-mode-tabs';
import { WordCountSelector } from './word-count-selector';

interface SeedGenerationConfigCardProps {
  onGenerate: (params: GenerateParams) => Promise<boolean>;
  isGenerating: boolean;
  error: string;
  defaultValues?: Partial<GenerateParams>;
}

export function SeedGenerationConfigCard({
  onGenerate,
  isGenerating,
  error,
  defaultValues,
}: SeedGenerationConfigCardProps) {
  const [mouseEntropy, setMouseEntropy] = useState<Uint8Array>(
    new Uint8Array(0)
  );

  const form = useForm({
    resolver: zodResolver(seedGenerationSchema),
    defaultValues: {
      generationMode: (defaultValues?.generationMode ||
        'random') as GenerationMode,
      wordCount: (defaultValues?.wordCount || 12) as WordCount,
      customEntropy: defaultValues?.customEntropy || '',
      passphrase: defaultValues?.passphrase || '',
    },
    mode: 'onChange',
  });

  const generationMode = form.watch('generationMode');
  const wordCount = form.watch('wordCount');

  const submitParams = (
    data: z.infer<typeof seedGenerationSchema>
  ): GenerateParams => ({
    generationMode: data.generationMode,
    wordCount: data.wordCount,
    customEntropy: data.customEntropy || '',
    passphrase: data.passphrase || '',
    mouseEntropy:
      data.generationMode === 'random' && mouseEntropy.length > 0
        ? mouseEntropy
        : undefined,
  });

  const onSubmit = async (
    data: z.infer<typeof seedGenerationSchema>
  ): Promise<void> => {
    await onGenerate(submitParams(data));
  };

  return (
    <Card>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <GenerationModeTabs
          mode={generationMode}
          onModeChange={(mode) => form.setValue('generationMode', mode)}
        />

        <WordCountSelector
          wordCount={wordCount}
          onWordCountChange={(count) => form.setValue('wordCount', count)}
        />

        {generationMode === 'custom' && (
          <EntropyInputSection
            wordCount={wordCount}
            entropy={form.watch('customEntropy') || ''}
            onEntropyChange={(value) => form.setValue('customEntropy', value)}
            error={form.formState.errors.customEntropy?.message || undefined}
          />
        )}

        <AdvancedOptions>
          <PassphraseInput
            passphrase={form.watch('passphrase') || ''}
            onPassphraseChange={(value) => form.setValue('passphrase', value)}
          />
          {generationMode === 'random' && (
            <MouseEntropyCollector
              onEntropyCollected={setMouseEntropy}
              disabled={isGenerating}
              label="Mouse entropy"
              description="Mixed into the browser generator, never used instead of it."
            />
          )}
        </AdvancedOptions>

        {error && <Alert variant="error">{error}</Alert>}

        <Button
          type="submit"
          disabled={isGenerating || form.formState.isSubmitting}
          className="w-full"
          size="lg"
        >
          <Key aria-hidden className="h-4 w-4" />
          {isGenerating ? 'Generating…' : `Generate ${wordCount}-word phrase`}
        </Button>
      </form>
    </Card>
  );
}
