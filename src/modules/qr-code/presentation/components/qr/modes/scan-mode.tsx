import { useState } from 'react';

import { ExternalLink } from 'lucide-react';

import { Alert } from '$/components/ui/alert';
import { Button } from '$/components/ui/button';
import { CopyButton } from '$/components/ui/copy-button';

import { QRScanner } from '../qr-scanner';

export function ScanMode() {
  const [scannedResult, setScannedResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleScan = (decodedText: string) => {
    setScannedResult(decodedText);
    setError(null);
  };

  const handleError = (errorMessage: string) => {
    setError(errorMessage);
  };

  const isUrl = (text: string) => {
    try {
      new URL(text);
      return true;
    } catch {
      return false;
    }
  };

  return (
    <div className="space-y-6">
      <div className="mx-auto max-w-2xl">
        <QRScanner onScan={handleScan} onError={handleError} />
      </div>

      {error && (
        <Alert variant="error" className="mx-auto max-w-2xl">
          {error}
        </Alert>
      )}

      {scannedResult && (
        <section
          aria-label="Scanned text"
          className="mx-auto max-w-2xl space-y-3 rounded-lg bg-surface-inset
            p-4"
        >
          <p className="font-mono text-sm break-all">{scannedResult}</p>
          <div className="flex flex-wrap gap-2">
            <CopyButton
              value={scannedResult}
              label="Copy"
              variant="outline"
              size="sm"
            />
            {isUrl(scannedResult) && (
              <Button asChild size="sm" variant="outline">
                <a
                  href={scannedResult}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <ExternalLink aria-hidden className="h-4 w-4" />
                  Open link
                </a>
              </Button>
            )}
          </div>
        </section>
      )}
    </div>
  );
}
