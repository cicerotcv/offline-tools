import { Badge } from '$/components/ui/badge';

import type {
  ShareLine,
  ShareLinesAnalysis,
  ShareLineStatus,
} from '../../../lib/encoding';

const LABEL: Record<ShareLineStatus, string> = {
  ok: 'Ready',
  legacy: 'Old format (v2)',
  duplicate: 'Duplicate',
  damaged: 'Damaged',
  conflict: 'Conflict',
  'other-set': 'Other set',
  invalid: 'Unreadable',
};

const VARIANT: Record<
  ShareLineStatus,
  'success' | 'warning' | 'destructive' | 'outline'
> = {
  ok: 'success',
  legacy: 'warning',
  duplicate: 'outline',
  damaged: 'destructive',
  conflict: 'destructive',
  'other-set': 'warning',
  invalid: 'destructive',
};

function LineRow({ line }: { line: ShareLine }) {
  return (
    <li className="flex flex-wrap items-center gap-x-3 gap-y-1 py-1.5 text-sm">
      <span className="w-12 font-mono text-xs text-muted-foreground">
        line {line.line}
      </span>
      {line.x !== undefined && (
        <span className="font-mono text-xs">
          share {line.x}/{line.total}
        </span>
      )}
      <Badge variant={VARIANT[line.status]}>{LABEL[line.status]}</Badge>
      {line.message && line.status !== 'duplicate' && (
        <span className="text-xs text-muted-foreground">{line.message}</span>
      )}
    </li>
  );
}

/** Per-line verdicts and the "x of M" counter under the share input. */
export function ShareLinesStatus({
  analysis,
}: {
  analysis: ShareLinesAnalysis;
}) {
  if (analysis.lines.length === 0) return null;
  const { have, threshold, setId, ready } = analysis;

  return (
    <div className="space-y-2">
      <p aria-live="polite" className="text-sm">
        {threshold === undefined ? (
          <span className="text-muted-foreground">No readable share yet.</span>
        ) : (
          <>
            <span className="font-medium">
              {have} of {threshold}
            </span>{' '}
            <span className="text-muted-foreground">
              shares
              {setId && (
                <>
                  {' '}
                  from set <span className="font-mono">{setId}</span>
                </>
              )}
              {ready ? ', ready to recover.' : '.'}
            </span>
          </>
        )}
      </p>
      <ul className="divide-y divide-border rounded-lg bg-surface-inset px-3">
        {analysis.lines.map((line) => (
          <LineRow key={line.line} line={line} />
        ))}
      </ul>
    </div>
  );
}
