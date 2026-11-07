import { useMemo, useState } from 'react';

import { Alert } from '$/components/ui/alert';
import { Button } from '$/components/ui/button';
import { FormSection } from '$/components/ui/form-section';
import { Input } from '$/components/ui/input';

import {
  type Algorithm,
  ALGORITHM_HEX_LENGTH,
  ALGORITHM_LABELS,
} from '../../../../domain/hash/algorithm';
import { compareHashes } from '../../../../lib/compare';
import { type HashInputState } from '../../../hooks/hash-input';
import { CameraCaptureModal } from '../camera-capture-modal';
import { HashInputPanel } from '../hash-input-panel';

interface VerifyModeProps {
  algorithm: Algorithm;
  input: HashInputState;
}

export function VerifyMode({ algorithm, input }: VerifyModeProps) {
  const [expectedHash, setExpectedHash] = useState('');

  const compareResult = useMemo(() => {
    if (input.isProcessing) return null;
    return compareHashes(input.hash, expectedHash, algorithm);
  }, [input.hash, input.isProcessing, expectedHash, algorithm]);

  const status = compareResult?.status;

  return (
    <>
      <HashInputPanel input={input} />

      <FormSection
        title="Published checksum"
        htmlFor="expected-hash"
        description={
          <>
            From the release notes or a{' '}
            <code className="text-xs">sha256sum</code> line. Case, a{' '}
            <code className="text-xs">0x</code> prefix and a trailing file name
            are ignored.
          </>
        }
        action={
          expectedHash && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setExpectedHash('')}
            >
              Clear
            </Button>
          )
        }
      >
        <Input
          id="expected-hash"
          value={expectedHash}
          onChange={(e) => setExpectedHash(e.target.value)}
          placeholder={`${ALGORITHM_LABELS[algorithm]} hex, ${ALGORITHM_HEX_LENGTH[algorithm]} characters`}
          className="font-mono text-sm"
          disabled={input.isProcessing}
        />
      </FormSection>

      {input.error && (
        <Alert variant="error" title="Could not compute the digest">
          {input.error}
        </Alert>
      )}

      {input.isProcessing && (
        <p role="status" className="text-sm text-muted-foreground">
          Computing…
        </p>
      )}

      {status === 'waiting-input' && expectedHash.trim() && (
        <p className="text-sm text-muted-foreground">
          Add the input above to compare.
        </p>
      )}

      {status === 'invalid-expected' && (
        <Alert variant="error" title="That is not a valid checksum">
          {compareResult!.message}
        </Alert>
      )}

      {status === 'match' && (
        <Alert variant="success" title="Checksums match">
          The {ALGORITHM_LABELS[algorithm]} digest of the input equals the
          published value.
        </Alert>
      )}

      {status === 'mismatch' && (
        <Alert variant="error" title="Checksums do not match">
          <p>
            The input changed, is the wrong file, or the checksum uses another
            algorithm.
          </p>
          <dl className="mt-3 grid gap-2 font-mono text-xs break-all">
            <div>
              <dt className="font-sans text-muted-foreground">Computed</dt>
              <dd>{compareResult!.computed}</dd>
            </div>
            <div>
              <dt className="font-sans text-muted-foreground">Expected</dt>
              <dd>{compareResult!.expected}</dd>
            </div>
          </dl>
        </Alert>
      )}

      {status !== 'match' &&
        status !== 'mismatch' &&
        !input.isProcessing &&
        input.hash &&
        !expectedHash.trim() && (
          <p className="text-xs break-all text-muted-foreground">
            Computed: <span className="font-mono">{input.hash}</span>
          </p>
        )}

      <CameraCaptureModal
        open={input.cameraModalOpen}
        onOpenChange={input.setCameraModalOpen}
        onCapture={input.handleCameraCapture}
        disabled={input.isProcessing}
      />
    </>
  );
}
