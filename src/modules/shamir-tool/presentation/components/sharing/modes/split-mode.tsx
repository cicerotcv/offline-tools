import { useState } from 'react';

import { Scissors } from 'lucide-react';

import { Alert } from '$/components/ui/alert';
import { Button } from '$/components/ui/button';
import { FormSection } from '$/components/ui/form-section';
import { SecretTextarea } from '$/components/ui/secret-field';
import { Skeleton } from '$/components/ui/skeleton';
import { downloadText } from '$/lib/download';

import type { SplitSecretResult } from '../../../../application/split-secret.use-case';
import {
  DEFAULT_SHARES,
  DEFAULT_THRESHOLD,
} from '../../../../domain/sharing/limits';
import { MAX_CARD_SECRET_BYTES } from '../../../../lib/cards';
import { useSecretSharing } from '../../../hooks/secret-sharing';
import { ConfigSection } from '../config-section';
import { ShareOutput } from '../share-output';

export function SplitMode() {
  const { splitSecret } = useSecretSharing();
  const [input, setInput] = useState('');
  const [n, setN] = useState(DEFAULT_SHARES);
  const [m, setM] = useState(DEFAULT_THRESHOLD);
  const [result, setResult] = useState<SplitSecretResult | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');

  const handleSplit = async () => {
    try {
      setIsProcessing(true);
      setError('');
      setResult(
        await splitSecret.execute({
          secret: input,
          totalShares: n,
          threshold: m,
        })
      );
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'The secret could not be split.'
      );
      setResult(null);
    } finally {
      setIsProcessing(false);
    }
  };

  const sharesText = result ? result.encoded.join('\n') : '';
  const secretBytes = new TextEncoder().encode(input).length;

  return (
    <div className="space-y-6">
      <FormSection title="Secret" htmlFor="secret-input">
        <SecretTextarea
          id="secret-input"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type or paste the secret to split."
          className="min-h-28"
          disabled={isProcessing}
        />
        {input && (
          <p className="text-xs text-muted-foreground">
            {secretBytes} bytes ·{' '}
            {secretBytes <= MAX_CARD_SECRET_BYTES
              ? 'fits a printed or engraved card'
              : `too long for a card (up to ${MAX_CARD_SECRET_BYTES} bytes); shares stay as text`}
          </p>
        )}
      </FormSection>

      <ConfigSection
        n={n}
        m={m}
        onNChange={setN}
        onMChange={setM}
        disabled={isProcessing}
      />

      <Button
        onClick={handleSplit}
        disabled={isProcessing || !input.trim() || m > n}
        className="w-full"
        size="lg"
      >
        <Scissors aria-hidden className="h-4 w-4" />
        {isProcessing ? 'Splitting…' : `Split into ${n} shares`}
      </Button>

      {error && <Alert variant="error">{error}</Alert>}

      {isProcessing ? (
        <Skeleton className="h-48 w-full" />
      ) : (
        result && (
          <ShareOutput
            shares={result.encoded}
            m={result.threshold}
            setId={result.setId}
            onDownload={() =>
              downloadText(
                `shamir-${result.setId}-${result.threshold}-of-${result.totalShares}.txt`,
                sharesText
              )
            }
            sharesText={sharesText}
          />
        )
      )}
    </div>
  );
}
