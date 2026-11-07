import { Download } from 'lucide-react';

import { Button } from '$/components/ui/button';
import { CopyButton } from '$/components/ui/copy-button';
import { FormSection } from '$/components/ui/form-section';

import { cardDensityFor, MAX_CARD_SECRET_BYTES } from '../../../lib/cards';
import { ShareCardsPrint } from './share-cards-print';
import { ShareItem } from './share-item';
import { ShareLaserExport } from './share-laser-export';

interface ShareOutputProps {
  /** One v2 share per entry. */
  shares: string[];
  /** The same shares, one per line: what Copy all and Download produce. */
  sharesText: string;
  m: number;
  /** "A1B2-C3D4", printed on every share of this split. */
  setId: string;
  onDownload: () => void;
}

export function ShareOutput({
  shares,
  sharesText,
  m,
  setId,
  onDownload,
}: ShareOutputProps) {
  const fitsCard = shares.every((share) => cardDensityFor(share.length));
  return (
    <FormSection
      title={`${shares.length} shares, any ${m} recover the secret`}
      description={
        <>
          Set <span className="font-mono text-foreground">{setId}</span>. Keep
          each share in a different place or with a different person; paste them
          back, one per line, in Reconstruct.
        </>
      }
      action={
        <>
          <CopyButton
            secret
            value={sharesText}
            variant="outline"
            size="sm"
            label="Copy all"
          />
          {fitsCard ? (
            <>
              <ShareCardsPrint shares={shares} setId={setId} threshold={m} />
              <ShareLaserExport shares={shares} setId={setId} threshold={m} />
            </>
          ) : (
            <Button
              variant="outline"
              size="sm"
              disabled
              title={`Shares of secrets over ${MAX_CARD_SECRET_BYTES} bytes do not fit a card or plate`}
            >
              Print or engrave
            </Button>
          )}
          <Button variant="outline" size="sm" onClick={onDownload}>
            <Download aria-hidden className="h-4 w-4" />
            Download
          </Button>
        </>
      }
    >
      {!fitsCard && (
        <p className="text-xs text-muted-foreground">
          This secret is too long for a printed or engraved card (up to{' '}
          {MAX_CARD_SECRET_BYTES} bytes). Keep the shares as text or files.
        </p>
      )}
      <ol className="space-y-2">
        {shares.map((share, index) => (
          <li key={index}>
            <ShareItem share={share} index={index} total={shares.length} />
          </li>
        ))}
      </ol>
    </FormSection>
  );
}
