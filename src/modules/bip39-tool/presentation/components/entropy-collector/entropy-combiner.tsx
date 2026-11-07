import { Shuffle } from 'lucide-react';

import { Alert } from '$/components/ui/alert';
import { Button } from '$/components/ui/button';
import { CopyButton } from '$/components/ui/copy-button';
import { Label } from '$/components/ui/label';
import { SecretTextarea } from '$/components/ui/secret-field';

import { entropyToHex } from '../../../lib/entropy';

interface EntropyCombinerProps {
  sources: Array<{
    name: string;
    entropy: Uint8Array | null;
  }>;
  combinedEntropy: Uint8Array | null;
  onCombine: () => Promise<void>;
  isProcessing?: boolean;
  disabled?: boolean;
  showHex?: boolean;
}

export function EntropyCombiner({
  sources,
  combinedEntropy,
  onCombine,
  isProcessing = false,
  disabled = false,
  showHex = true,
}: EntropyCombinerProps) {
  const activeSources = sources.filter((s) => s.entropy !== null);
  const hasMultipleSources = activeSources.length > 1;
  const combinedHex = combinedEntropy ? entropyToHex(combinedEntropy) : '';

  if (activeSources.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      {hasMultipleSources && (
        <Button
          type="button"
          onClick={onCombine}
          disabled={disabled || isProcessing || !!combinedEntropy}
          className="w-full"
          size="lg"
        >
          <Shuffle className="mr-2 h-4 w-4" />
          {isProcessing
            ? 'Combining...'
            : combinedEntropy
              ? 'Entropy combined'
              : 'Combine entropy'}
        </Button>
      )}

      {combinedEntropy && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-medium text-foreground/80">
              Combined entropy
            </Label>
            {showHex && combinedHex && (
              <CopyButton
                secret
                value={combinedHex}
                variant="ghost"
                size="sm"
                label="Copy"
              />
            )}
          </div>
          {showHex && (
            <SecretTextarea
              value={combinedHex}
              readOnly
              className="min-h-24 font-mono text-sm"
              placeholder="Combined entropy will appear here..."
            />
          )}
          <Alert variant="info" className="p-2">
            ✓ Combined entropy: {combinedEntropy.length} bytes (
            {combinedEntropy.length * 8} bits)
          </Alert>
        </div>
      )}

      {!hasMultipleSources && activeSources.length === 1 && (
        <Alert variant="info" className="p-2">
          ℹ Only one entropy source collected. Add more sources for better
          security.
        </Alert>
      )}
    </div>
  );
}
