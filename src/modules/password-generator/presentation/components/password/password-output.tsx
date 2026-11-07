import { RefreshCw } from 'lucide-react';

import { Button } from '$/components/ui/button';
import { CopyButton } from '$/components/ui/copy-button';
import { Disclosure } from '$/components/ui/disclosure';

import type { PasswordConfig } from '../../../domain/password/password-config';
import {
  calculatePasswordEntropy,
  calculatePasswordStrength,
  getPasswordStrengthLabel,
  getTimeToCrackEstimates,
} from '../../../lib/password';

interface PasswordOutputProps {
  password: string;
  config: PasswordConfig;
  onRegenerate: () => void;
}

export function PasswordOutput({
  password,
  config,
  onRegenerate,
}: PasswordOutputProps) {
  const strength = calculatePasswordStrength(password, config);
  const { label, color } = getPasswordStrengthLabel(strength);
  const entropy = calculatePasswordEntropy(password, config);
  const timeToCrack = getTimeToCrackEstimates(entropy);

  return (
    <section aria-label="Generated password" className="space-y-3">
      <div className="flex items-start gap-2 rounded-lg bg-surface-inset p-4">
        <p
          aria-live="polite"
          className="min-h-7 flex-1 font-mono text-lg break-all select-text"
        >
          {password}
        </p>
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={onRegenerate}
          aria-label="Generate another password"
        >
          <RefreshCw aria-hidden className="h-4 w-4" />
        </Button>
        <CopyButton
          secret
          value={password}
          variant="outline"
          size="sm"
          label="Copy"
        />
      </div>

      <div className="flex items-center gap-3 text-sm">
        <div className="h-1.5 flex-1 rounded-full bg-muted">
          <div
            className="h-1.5 rounded-full transition-all"
            style={{
              width: `${strength}%`,
              backgroundColor:
                strength < 30
                  ? 'var(--destructive)'
                  : strength < 70
                    ? 'var(--warning)'
                    : 'var(--success)',
            }}
          />
        </div>
        <span className={`font-medium ${color}`}>{label}</span>
        <span className="font-mono text-xs text-muted-foreground">
          {entropy.toFixed(0)} bits
        </span>
      </div>

      <Disclosure title="Time to crack">
        <dl className="grid max-w-md gap-1.5 text-sm">
          <div className="flex justify-between gap-4">
            <dt className="text-muted-foreground">
              Online, 1,000 guesses per second
            </dt>
            <dd className="font-medium">{timeToCrack.online.formatted}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-muted-foreground">
              Offline, 1 billion guesses per second
            </dt>
            <dd className="font-medium">{timeToCrack.offline.formatted}</dd>
          </div>
        </dl>
      </Disclosure>
    </section>
  );
}
