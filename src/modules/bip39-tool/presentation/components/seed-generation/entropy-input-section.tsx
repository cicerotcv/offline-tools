import { assessHexEntropy } from '@/shared/lib/entropy/quality';

import { Alert } from '$/components/ui/alert';
import { Button } from '$/components/ui/button';
import { Disclosure } from '$/components/ui/disclosure';
import { Label } from '$/components/ui/label';
import { SecretTextarea } from '$/components/ui/secret-field';

import type { WordCount } from '../../../domain/bitcoin/config';
import { getWordCountConfig } from '../../../domain/mnemonic/word-counts';
import { entropyToHex } from '../../../lib/entropy';
import { useEntropyCollector } from '../../hooks/entropy-collector';
import {
  CameraEntropyCollector,
  EntropyCombiner,
  EntropySourceStatus,
  FileEntropyInput,
  MouseEntropyCollector,
  TextEntropyInput,
} from '../entropy-collector';

interface EntropyInputSectionProps {
  wordCount: WordCount;
  entropy: string;
  onEntropyChange: (entropy: string) => void;
  error?: string;
}

export function EntropyInputSection({
  wordCount,
  entropy,
  onEntropyChange,
  error,
}: EntropyInputSectionProps) {
  const config = getWordCountConfig(wordCount);
  const hexLength = entropy.replace(/\s+/g, '').length;

  const {
    combinedEntropy,
    isProcessing: isCollecting,
    error: collectorError,
    sources,
    collectTextEntropy,
    collectFileEntropy,
    collectMouseEntropy,
    collectCameraEntropy,
    combineAllEntropy,
    clearAll,
  } = useEntropyCollector({ autoCombine: false });

  const activeSources = sources.filter((s) => s.entropy !== null);
  const hasSingleSource = activeSources.length === 1;
  const singleSourceEntropy = hasSingleSource ? activeSources[0].entropy : null;

  const handleUseCollectedEntropy = () => {
    if (combinedEntropy) {
      onEntropyChange(entropyToHex(combinedEntropy));
    }
  };

  const handleUseSingleSource = () => {
    if (singleSourceEntropy) {
      onEntropyChange(entropyToHex(singleSourceEntropy));
    }
  };

  const entropyQuality = assessHexEntropy(entropy);

  return (
    <div className="space-y-4">
      <Label htmlFor="entropy-input" className="text-sm font-medium">
        Entropy (hex)
      </Label>

      {entropyQuality.looksWeak && (
        <Alert variant="error" className="p-3">
          This entropy looks weak (repeated characters or a pattern). Anyone
          could guess a seed made from it.
        </Alert>
      )}

      <div className="space-y-1">
        <SecretTextarea
          id="entropy-input"
          value={entropy}
          onChange={(e) => onEntropyChange(e.target.value)}
          placeholder={`At least ${config.entropyHexLength} hex characters from dice, coins or another verified source.`}
          className="min-h-24 font-mono text-sm break-all whitespace-pre-wrap"
        />
        <p className="text-xs text-muted-foreground">
          {hexLength} of {config.entropyHexLength} hex characters (
          {config.entropyBits} bits)
          {hexLength >= config.entropyHexLength && (
            <span className="ml-1 text-success">enough</span>
          )}
        </p>
      </div>

      {error && (
        <Alert variant="error" className="p-2">
          {error}
        </Alert>
      )}

      <Disclosure title="Collect it from text, a file, the mouse or the camera">
        <div className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <TextEntropyInput
              onCollect={collectTextEntropy}
              isProcessing={isCollecting}
              hasEntropy={!!sources.find((s) => s.name === 'Text')?.entropy}
              disabled={false}
            />
            <FileEntropyInput
              onCollect={collectFileEntropy}
              isProcessing={isCollecting}
              hasEntropy={!!sources.find((s) => s.name === 'File')?.entropy}
              disabled={false}
            />
            <MouseEntropyCollector
              onEntropyCollected={collectMouseEntropy}
              isProcessing={isCollecting}
              disabled={false}
            />
            <CameraEntropyCollector
              onCollect={collectCameraEntropy}
              isProcessing={isCollecting}
              hasEntropy={!!sources.find((s) => s.name === 'Camera')?.entropy}
              disabled={false}
            />
          </div>

          <EntropySourceStatus sources={sources} />

          {hasSingleSource && !combinedEntropy && singleSourceEntropy && (
            <Alert variant="info" className="p-4">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-medium">
                    {activeSources[0].name} entropy ready
                  </p>
                  <p className="text-xs opacity-80">
                    {singleSourceEntropy.length} bytes
                  </p>
                </div>
                <Button type="button" onClick={handleUseSingleSource} size="sm">
                  Use this entropy
                </Button>
              </div>
            </Alert>
          )}

          {activeSources.length > 1 && (
            <EntropyCombiner
              sources={sources}
              combinedEntropy={combinedEntropy}
              onCombine={combineAllEntropy}
              isProcessing={isCollecting}
              disabled={false}
              showHex={false}
            />
          )}

          {combinedEntropy && (
            <Button
              type="button"
              onClick={handleUseCollectedEntropy}
              className="w-full"
            >
              Use the combined entropy
            </Button>
          )}

          {sources.some((s) => s.entropy !== null) && (
            <div className="flex justify-end">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={clearAll}
                disabled={isCollecting}
              >
                Clear
              </Button>
            </div>
          )}

          {collectorError && (
            <Alert variant="error" className="p-2">
              {collectorError}
            </Alert>
          )}
        </div>
      </Disclosure>
    </div>
  );
}
