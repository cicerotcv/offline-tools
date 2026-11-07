import { Eye, EyeOff } from 'lucide-react';

import { Button } from './button';

interface RevealToggleProps {
  revealed: boolean;
  onToggle: () => void;
  /** What is being revealed, for screen readers ("seed phrase"). */
  subject: string;
  disabled?: boolean;
}

/** Show / Hide control for secrets that start masked. */
export function RevealToggle({
  revealed,
  onToggle,
  subject,
  disabled,
}: RevealToggleProps) {
  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      onClick={onToggle}
      disabled={disabled}
      aria-pressed={revealed}
      aria-label={`${revealed ? 'Hide' : 'Show'} ${subject}`}
    >
      {revealed ? (
        <EyeOff aria-hidden className="h-4 w-4" />
      ) : (
        <Eye aria-hidden className="h-4 w-4" />
      )}
      {revealed ? 'Hide' : 'Show'}
    </Button>
  );
}
