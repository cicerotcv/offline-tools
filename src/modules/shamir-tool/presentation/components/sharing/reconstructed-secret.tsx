import { Download } from 'lucide-react';

import { Button } from '$/components/ui/button';
import { CopyButton } from '$/components/ui/copy-button';
import { FormSection } from '$/components/ui/form-section';
import { downloadText } from '$/lib/download';

interface ReconstructedSecretProps {
  secret: string;
}

export function ReconstructedSecret({ secret }: ReconstructedSecretProps) {
  return (
    <FormSection
      title="Recovered secret"
      action={
        <>
          <CopyButton
            secret
            value={secret}
            variant="outline"
            size="sm"
            label="Copy"
          />
          <Button
            variant="outline"
            size="sm"
            onClick={() => downloadText('recovered-secret.txt', secret)}
          >
            <Download aria-hidden className="h-4 w-4" />
            Download
          </Button>
        </>
      }
    >
      <pre
        className="rounded-lg bg-surface-inset p-4 font-mono text-sm
          wrap-break-word whitespace-pre-wrap"
      >
        {secret}
      </pre>
    </FormSection>
  );
}
