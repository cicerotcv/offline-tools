import { Download } from 'lucide-react';

import { Button } from '$/components/ui/button';
import { CopyButton } from '$/components/ui/copy-button';
import { FormSection } from '$/components/ui/form-section';
import { SecretTextarea } from '$/components/ui/secret-field';
import { Skeleton } from '$/components/ui/skeleton';

interface OutputSectionProps {
  output: string;
  operationMode: 'encrypt' | 'decrypt';
  isProcessing?: boolean;
  onDownload: () => void;
}

export function OutputSection({
  output,
  operationMode,
  isProcessing = false,
  onDownload,
}: OutputSectionProps) {
  const encrypt = operationMode === 'encrypt';
  return (
    <FormSection
      title={encrypt ? 'Encrypted message' : 'Decrypted text'}
      htmlFor="cipher-output"
      action={
        output &&
        !isProcessing && (
          <>
            <CopyButton
              secret={!encrypt}
              value={output}
              variant="outline"
              size="sm"
              label="Copy"
            />
            <Button variant="outline" size="sm" onClick={onDownload}>
              <Download aria-hidden className="h-4 w-4" />
              Download
            </Button>
          </>
        )
      }
    >
      {isProcessing ? (
        <Skeleton className="h-32 w-full" />
      ) : (
        <SecretTextarea
          id="cipher-output"
          value={output}
          readOnly
          className="min-h-32 font-mono text-sm"
          placeholder={
            encrypt
              ? 'The armored message appears here.'
              : 'The decrypted text appears here.'
          }
        />
      )}
    </FormSection>
  );
}
