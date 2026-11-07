import { Link } from '@tanstack/react-router';

import { Alert } from '$/components/ui/alert';
import { Badge } from '$/components/ui/badge';
import { CopyButton } from '$/components/ui/copy-button';

import type {
  ChecksumStatus,
  WordCountStatus,
} from '../../hooks/tiny-seed-words';

interface MnemonicStatusPanelProps {
  wordCount: number;
  wordCountStatus: WordCountStatus;
  checksumStatus: ChecksumStatus;
  invalidWords: string[];
  mnemonic: string;
  /** Tiny Seed points to Seed Validation; Seed Validation itself does not. */
  linkToValidation?: boolean;
  /** Offer copying the normalized phrase once it is well formed. */
  allowCopy?: boolean;
}

/** Live verdict for a typed phrase: length, unknown words and checksum. */
export function MnemonicStatusPanel({
  wordCount,
  wordCountStatus,
  checksumStatus,
  invalidWords,
  mnemonic,
  linkToValidation = true,
  allowCopy = true,
}: MnemonicStatusPanelProps) {
  if (wordCountStatus === 'empty') return null;

  const isValidLength = wordCountStatus === 'valid-length';
  const canCopy =
    allowCopy && invalidWords.length === 0 && checksumStatus !== null;

  return (
    <div className="space-y-3" aria-live="polite">
      <div className="flex flex-wrap items-center gap-2">
        <Badge variant={isValidLength ? 'success' : 'outline'}>
          {wordCount} {wordCount === 1 ? 'word' : 'words'}
          {isValidLength ? '' : ', needs 12, 15, 18, 21 or 24'}
        </Badge>
        {canCopy && (
          <CopyButton
            secret
            value={mnemonic}
            variant="outline"
            size="sm"
            label="Copy phrase"
          />
        )}
      </div>

      {invalidWords.length > 0 && (
        <Alert variant="warning" title="Not in the BIP39 wordlist">
          <p className="font-mono">{invalidWords.join(', ')}</p>
        </Alert>
      )}

      {checksumStatus === 'valid' && (
        <Alert variant="success" title="Valid phrase">
          Every word is in the wordlist and the checksum matches.
          {linkToValidation && (
            <>
              {' '}
              <Link
                to="/tools/seed-validation"
                className="font-medium underline underline-offset-2"
              >
                Open in Seed Validation
              </Link>
              .
            </>
          )}
        </Alert>
      )}

      {checksumStatus === 'invalid' && (
        <Alert variant="error" title="Wrong checksum">
          Every word is in the wordlist, but the checksum does not match: a word
          is wrong or out of order.
        </Alert>
      )}
    </div>
  );
}
