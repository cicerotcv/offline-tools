import { Download } from 'lucide-react';

import { Alert } from '$/components/ui/alert';
import { Button } from '$/components/ui/button';
import { CopyButton } from '$/components/ui/copy-button';
import { FormSection } from '$/components/ui/form-section';
import { Tabs, TabsList, TabsTrigger } from '$/components/ui/tabs';
import { Textarea } from '$/components/ui/textarea';
import { downloadText } from '$/lib/download';

import {
  type Algorithm,
  ALGORITHM_LABELS,
  formatHashHex,
  type HashCase,
} from '../../../domain/hash/algorithm';

interface HashOutputSectionProps {
  hash: string;
  algorithm: Algorithm;
  hashCase: HashCase;
  onHashCaseChange: (hashCase: HashCase) => void;
  error: string | null;
  isProcessing?: boolean;
  inputLabel?: string;
  imagePreview?: string | null;
}

export function HashOutputSection({
  hash,
  algorithm,
  hashCase,
  onHashCaseChange,
  error,
  isProcessing = false,
  inputLabel,
  imagePreview,
}: HashOutputSectionProps) {
  const formattedHash = hash ? formatHashHex(hash, hashCase) : '';

  return (
    <div className="space-y-4">
      {imagePreview && (
        <img
          src={imagePreview}
          alt="Captured photo"
          className="mx-auto h-auto max-h-64 w-auto rounded-lg border"
        />
      )}

      {error && (
        <Alert variant="error" title="Could not compute the digest">
          {error}
        </Alert>
      )}

      <FormSection
        title={`${ALGORITHM_LABELS[algorithm]} digest`}
        htmlFor="hash-output"
        action={
          formattedHash && (
            <>
              <Tabs
                value={hashCase}
                onValueChange={(value) => onHashCaseChange(value as HashCase)}
              >
                <TabsList aria-label="Letter case" className="h-8">
                  <TabsTrigger value="lower" className="px-2 font-mono text-xs">
                    a-f
                  </TabsTrigger>
                  <TabsTrigger value="upper" className="px-2 font-mono text-xs">
                    A-F
                  </TabsTrigger>
                </TabsList>
              </Tabs>
              <CopyButton
                value={formattedHash}
                variant="outline"
                size="sm"
                label="Copy"
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() =>
                  downloadText(
                    `${ALGORITHM_LABELS[algorithm].toLowerCase()}.txt`,
                    formattedHash
                  )
                }
              >
                <Download aria-hidden className="h-4 w-4" />
                Download
              </Button>
            </>
          )
        }
      >
        <Textarea
          id="hash-output"
          value={formattedHash}
          readOnly
          placeholder={isProcessing ? 'Computing…' : 'The digest appears here.'}
          className="min-h-20 font-mono text-sm"
        />
        {formattedHash && inputLabel && (
          <p className="text-xs text-muted-foreground">{inputLabel}</p>
        )}
      </FormSection>
    </div>
  );
}
