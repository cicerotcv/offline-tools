import { useState } from 'react';

import { Combine } from 'lucide-react';

import { Alert } from '$/components/ui/alert';
import { Button } from '$/components/ui/button';
import { Skeleton } from '$/components/ui/skeleton';

import type { ReconstructSecretResult } from '../../../../application/reconstruct-secret.use-case';
import { useSecretSharing } from '../../../hooks/secret-sharing';
import { useShareLines } from '../../../hooks/share-lines';
import { OpaqueOutput } from '../opaque-output';
import { ReconstructedSecret } from '../reconstructed-secret';
import { ShareInput } from '../share-input';
import { ShareLinesStatus } from '../share-lines-status';

type ReconstructState = ReconstructSecretResult;

export function ReconstructMode() {
  const { reconstructSecret } = useSecretSharing();
  const [shareInput, setShareInput] = useState('');
  const [result, setResult] = useState<ReconstructState | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');
  const analysis = useShareLines(shareInput);

  const handleReconstruct = async () => {
    if (!shareInput.trim()) {
      setError('Paste at least one share.');
      return;
    }

    try {
      setIsProcessing(true);
      setError('');
      setResult(null);

      setResult(await reconstructSecret.execute({ shareText: shareInput }));
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'The shares could not be read.'
      );
      setResult(null);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      <ShareInput
        value={shareInput}
        onChange={(value) => {
          setShareInput(value);
          setResult(null);
          setError('');
        }}
        disabled={isProcessing}
      />

      <ShareLinesStatus analysis={analysis} />

      <Button
        onClick={handleReconstruct}
        disabled={isProcessing || !analysis.ready}
        className="w-full"
        size="lg"
      >
        <Combine aria-hidden className="h-4 w-4" />
        {isProcessing ? 'Recovering…' : 'Recover secret'}
      </Button>

      {error && <Alert variant="error">{error}</Alert>}

      {!result &&
        !analysis.ready &&
        analysis.locked &&
        analysis.threshold !== undefined &&
        analysis.have > 0 && (
          <OpaqueOutput
            opaque={analysis.locked}
            threshold={analysis.threshold}
            have={analysis.have}
          />
        )}

      {isProcessing ? (
        <div className="space-y-2">
          <Skeleton className="h-32 w-full" />
        </div>
      ) : (
        result && (
          <div className="space-y-4">
            {result.kind === 'valid' && (
              <>
                {result.legacy && (
                  <Alert variant="warning" title="Old share format (v2)">
                    These shares are not authenticated. The secret opened, but
                    split it again to get v3 shares, which detect damage.
                  </Alert>
                )}
                {result.skipped.length > 0 && (
                  <Alert variant="info" title="Some lines were left out">
                    Line{result.skipped.length > 1 ? 's' : ''}{' '}
                    {result.skipped.join(', ')}{' '}
                    {result.skipped.length > 1 ? 'were' : 'was'} damaged, from
                    another set or conflicting; the secret opened with the
                    others.
                  </Alert>
                )}
                {result.suspects.length > 0 && (
                  <Alert variant="warning" title="A share does not belong">
                    The secret opened without share
                    {result.suspects.length > 1 ? 's' : ''}{' '}
                    {result.suspects.join(', ')}. That copy is damaged or was
                    altered: replace it.
                  </Alert>
                )}
                <ReconstructedSecret secret={result.secret} />
              </>
            )}
            {result.kind === 'opaque' && (
              <OpaqueOutput
                opaque={result.opaque}
                threshold={result.threshold}
                have={result.have}
              />
            )}
            {result.kind === 'rejected' && (
              <Alert
                variant="error"
                title="These shares do not open the secret"
              >
                There are enough shares, but the result does not authenticate:
                at least one share is damaged or was altered, and no group of{' '}
                {result.threshold} opens it. Try other copies.
              </Alert>
            )}
          </div>
        )
      )}
    </div>
  );
}
