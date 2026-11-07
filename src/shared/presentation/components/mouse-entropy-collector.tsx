import { useRef, useState } from 'react';

import { MousePointer2, Square } from 'lucide-react';

import { mouseEntropyFromSamples } from '@/shared/lib/entropy/mouse';

import { Button } from '$/components/ui/button';
import { Label } from '$/components/ui/label';
import { Progress } from '$/components/ui/progress';

interface MouseEntropyCollectorProps {
  onEntropyCollected: (entropy: Uint8Array) => void;
  minSamples?: number;
  maxSamples?: number;
  disabled?: boolean;
  className?: string;
  isProcessing?: boolean;
  label?: string;
  description?: string;
}

const SAMPLE_INTERVAL_MS = 50; // Sample every 50ms

export function MouseEntropyCollector({
  onEntropyCollected,
  minSamples = 100,
  maxSamples = 200,
  disabled = false,
  className = '',
  isProcessing = false,
  label = 'Mouse entropy',
  description = 'Move your mouse randomly in the area below to add extra randomness.',
}: MouseEntropyCollectorProps) {
  const [isCollecting, setIsCollecting] = useState(false);
  const [sampleCount, setSampleCount] = useState(0);
  const [trail, setTrail] = useState<Array<{ x: number; y: number }>>([]);

  const positionsRef = useRef<
    Array<{ x: number; y: number; timestamp: number }>
  >([]);
  const lastSampleTimeRef = useRef<number>(0);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isCollecting || disabled || isProcessing) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const now = performance.now();

    // Always update trail for smooth visualization
    setTrail((prev) => {
      const newTrail = [...prev, { x, y }];
      return newTrail.slice(-100);
    });

    // Throttle entropy collection - only sample at intervals
    if (now - lastSampleTimeRef.current >= SAMPLE_INTERVAL_MS) {
      lastSampleTimeRef.current = now;

      // Store raw position data
      positionsRef.current.push({ x, y, timestamp: now });
      const newCount = positionsRef.current.length;
      setSampleCount(newCount);

      // Optional: Auto-stop at significantly higher than maxSamples?
      // For now, let user stop, or stop at capacity if memory concerns (unlikely here).
    }
  };

  const handleStart = () => {
    setIsCollecting(true);
    setSampleCount(0);
    setTrail([]);
    positionsRef.current = [];
    lastSampleTimeRef.current = 0;
  };

  const processEntropy = async () => {
    if (positionsRef.current.length === 0) {
      onEntropyCollected(new Uint8Array(0));
      return;
    }

    try {
      onEntropyCollected(await mouseEntropyFromSamples(positionsRef.current));
    } catch (error) {
      console.error('Failed to process mouse entropy', error);
    }
  };

  const handleStop = async () => {
    setIsCollecting(false);
    await processEntropy();
  };

  const handleClear = () => {
    setIsCollecting(false);
    setSampleCount(0);
    setTrail([]);
    positionsRef.current = [];
    onEntropyCollected(new Uint8Array(0));
  };

  const progress = Math.min((sampleCount / maxSamples) * 100, 100);
  const hasEnoughSamples = sampleCount >= minSamples;

  return (
    <div
      className={`space-y-4 rounded-lg border border-border bg-muted/50 p-4
        ${className}`}
    >
      <div className="flex items-center justify-between">
        <Label className="text-sm font-medium text-foreground/80">
          {label}
        </Label>
        <div className="flex gap-2">
          {!isCollecting ? (
            <Button
              type="button"
              onClick={handleStart}
              variant="outline"
              size="sm"
              disabled={disabled || isProcessing}
              className="gap-2"
            >
              <MousePointer2 className="h-4 w-4" />
              Start collecting
            </Button>
          ) : (
            <Button
              type="button"
              onClick={handleStop}
              variant="outline"
              size="sm"
              disabled={disabled || isProcessing}
              className="gap-2"
            >
              <Square className="h-4 w-4" />
              Stop ({sampleCount})
            </Button>
          )}
          {sampleCount > 0 && (
            <Button
              type="button"
              onClick={handleClear}
              variant="ghost"
              size="sm"
              disabled={disabled || isProcessing || isCollecting}
            >
              Clear
            </Button>
          )}
        </div>
      </div>

      <p className="text-xs text-muted-foreground">{description}</p>

      <div
        onMouseMove={handleMouseMove}
        className={`relative h-64 w-full rounded-lg border-2 border-dashed
          transition-colors ${
            isCollecting
              ? `cursor-crosshair border-primary bg-primary/5
                dark:border-primary dark:bg-primary/10`
              : 'border-foreground/20 bg-muted'
          } ${disabled || isProcessing ? 'cursor-not-allowed opacity-50' : ''}`}
      >
        {!isCollecting && sampleCount === 0 && (
          <div className="absolute inset-0 flex items-center justify-center">
            <p className="text-sm text-muted-foreground">
              Click "Start collecting" and move your mouse around this area
            </p>
          </div>
        )}

        {isCollecting && (
          <div className="absolute inset-0 overflow-hidden rounded-lg">
            {trail.map((point, index) => (
              <div
                key={index}
                className="absolute h-1.5 w-1.5 rounded-full bg-primary"
                style={{
                  left: `${point.x}px`,
                  top: `${point.y}px`,
                  opacity: Math.max(0.3, index / trail.length),
                  transform: 'translate(-50%, -50%)',
                  pointerEvents: 'none',
                }}
              />
            ))}
          </div>
        )}

        {sampleCount > 0 && !isCollecting && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="rounded-lg bg-card/90 p-4 text-center">
              <p className="text-sm font-medium text-foreground">
                Collected {sampleCount} samples
              </p>
              {!hasEnoughSamples && (
                <p className="mt-1 text-xs text-accent-strong">
                  Minimum {minSamples} samples recommended
                </p>
              )}
            </div>
          </div>
        )}
      </div>

      {isCollecting && (
        <div className="space-y-1">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Progress</span>
            <span
              className={
                hasEnoughSamples ? 'text-success' : 'text-muted-foreground'
              }
            >
              {hasEnoughSamples ? 'Ready' : 'Collecting...'}
            </span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>
      )}

      <p className="text-xs text-muted-foreground">
        {isCollecting
          ? `Move your mouse around the area above. Collected: ${sampleCount} samples (minimum: ${minSamples}, target: ${maxSamples})`
          : `Mouse movements provide entropy based on timing and position. Collect at least ${minSamples} samples for good entropy.`}
      </p>
    </div>
  );
}
