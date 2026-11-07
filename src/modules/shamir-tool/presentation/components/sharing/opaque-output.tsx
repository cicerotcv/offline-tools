import { EyeOff } from 'lucide-react';

import { bytesToHex } from '@/shared/lib/bytes';

interface OpaqueOutputProps {
  opaque: Uint8Array;
  threshold: number;
  have: number;
}

/** What stays locked with too few shares: noise, never part of the secret. */
export function OpaqueOutput({ opaque, threshold, have }: OpaqueOutputProps) {
  const hexDisplay = bytesToHex(opaque);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <EyeOff aria-hidden className="h-4 w-4 text-muted-foreground" />
        <h3 className="text-sm font-medium">
          Locked: {have} of {threshold} shares
        </h3>
      </div>

      <p className="text-sm text-muted-foreground">
        Add {threshold - have} more. Until then the secret stays sealed, as the
        noise below, never part of it.
      </p>

      <div
        className="rounded-lg border border-dashed border-foreground/20 bg-muted
          p-4"
      >
        <pre
          className="max-h-48 overflow-auto font-mono text-xs break-all
            text-muted-foreground"
        >
          {hexDisplay}
        </pre>
      </div>
    </div>
  );
}
