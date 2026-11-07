import { useState } from 'react';

import { CheckCircle2 } from 'lucide-react';

import { Alert } from '$/components/ui/alert';
import { Button } from '$/components/ui/button';
import { Label } from '$/components/ui/label';
import { SecretInput } from '$/components/ui/secret-field';

import { verifyWords } from '../../../lib/backup-verify';

interface SeedBackupVerifyStepProps {
  mnemonic: string;
  indices: number[];
  onVerified: () => void;
  onStartOver: () => void;
}

export function SeedBackupVerifyStep({
  mnemonic,
  indices,
  onVerified,
  onStartOver,
}: SeedBackupVerifyStepProps) {
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [error, setError] = useState('');

  const handleVerify = () => {
    const allFilled = indices.every(
      (index) => (answers[index] || '').trim().length > 0
    );

    if (!allFilled) {
      setError('Please enter all requested words.');
      return;
    }

    if (verifyWords(mnemonic, answers)) {
      setError('');
      onVerified();
      return;
    }

    setError(
      'One or more words are incorrect. Check your backup and try again.'
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-heading">Check your backup</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Type these words from your paper, not from the screen.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {indices.map((index) => (
          <div key={index} className="space-y-2">
            <Label htmlFor={`verify-word-${index}`}>Word {index + 1}</Label>
            <SecretInput
              id={`verify-word-${index}`}
              value={answers[index] || ''}
              onChange={(e) =>
                setAnswers((prev) => ({
                  ...prev,
                  [index]: e.target.value,
                }))
              }
              autoComplete="off"
            />
          </div>
        ))}
      </div>

      {error && <Alert variant="error">{error}</Alert>}

      <div className="flex flex-col gap-3 sm:flex-row">
        <Button
          type="button"
          variant="outline"
          onClick={onStartOver}
          className="sm:flex-1"
        >
          Start over
        </Button>
        <Button type="button" onClick={handleVerify} className="sm:flex-1">
          <CheckCircle2 aria-hidden className="h-4 w-4" />
          Check words
        </Button>
      </div>
    </div>
  );
}
