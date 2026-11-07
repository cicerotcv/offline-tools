import { Input } from '$/components/ui/input';
import { Label } from '$/components/ui/label';

import {
  MAX_SHARES,
  MAX_THRESHOLD,
  MIN_SHARES,
  MIN_THRESHOLD,
} from '../../../domain/sharing/limits';

interface ConfigSectionProps {
  n: number;
  m: number;
  onNChange: (n: number) => void;
  onMChange: (m: number) => void;
  disabled?: boolean;
}

export function ConfigSection({
  n,
  m,
  onNChange,
  onMChange,
  disabled = false,
}: ConfigSectionProps) {
  return (
    <section className="space-y-2.5">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="n-shares" className="text-sm font-medium">
            Shares to create (N)
          </Label>
          <Input
            id="n-shares"
            type="number"
            min={MIN_SHARES}
            max={MAX_SHARES}
            value={n}
            onChange={(e) => {
              const value = parseInt(e.target.value, 10);
              if (isNaN(value)) return;
              const next = Math.max(MIN_SHARES, Math.min(MAX_SHARES, value));
              onNChange(next);
              if (m > next) onMChange(next);
            }}
            disabled={disabled}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="m-threshold" className="text-sm font-medium">
            Shares needed to recover (M)
          </Label>
          <Input
            id="m-threshold"
            type="number"
            min={MIN_THRESHOLD}
            max={Math.min(MAX_THRESHOLD, n)}
            value={m}
            onChange={(e) => {
              const value = parseInt(e.target.value, 10);
              if (isNaN(value)) return;
              onMChange(
                Math.max(MIN_THRESHOLD, Math.min(MAX_THRESHOLD, n, value))
              );
            }}
            disabled={disabled}
          />
        </div>
      </div>
      <p aria-live="polite" className="text-sm text-muted-foreground">
        Any <span className="font-medium text-foreground">{m}</span> of{' '}
        <span className="font-medium text-foreground">{n}</span> shares recover
        the secret; {m - 1} or fewer reveal nothing.
      </p>
    </section>
  );
}
