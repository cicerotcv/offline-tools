import { CheckCircle2, Circle } from 'lucide-react';

interface EntropySourceStatusProps {
  sources: Array<{
    name: string;
    entropy: Uint8Array | null;
  }>;
  className?: string;
}

export function EntropySourceStatus({
  sources,
  className = '',
}: EntropySourceStatusProps) {
  const activeSources = sources.filter((s) => s.entropy !== null);
  const totalSources = sources.length;

  if (activeSources.length === 0) {
    return null;
  }

  return (
    <div className={`space-y-2 ${className}`}>
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium text-foreground/80">Entropy sources</span>
        <span className="text-muted-foreground">
          {activeSources.length} / {totalSources}
        </span>
      </div>
      <div className="space-y-1">
        {sources.map((source) => (
          <div key={source.name} className="flex items-center gap-2 text-sm">
            {source.entropy ? (
              <>
                <CheckCircle2 className="h-4 w-4 text-success" />
                <span className="text-foreground/80">{source.name}</span>
                <span className="ml-auto text-xs text-muted-foreground">
                  {source.entropy.length} bytes
                </span>
              </>
            ) : (
              <>
                <Circle className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">{source.name}</span>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
