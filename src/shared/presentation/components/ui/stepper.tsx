import { Check } from 'lucide-react';

import { cn } from '../../lib/utils';

export interface StepperStep<TStep extends string> {
  id: TStep;
  label: string;
}

interface StepperProps<TStep extends string> {
  steps: readonly StepperStep<TStep>[];
  current: TStep;
  /** Accessible name of the flow, e.g. "Seed generation progress". */
  label: string;
}

/** Linear progress for guided flows. Steps before `current` are complete. */
export function Stepper<TStep extends string>({
  steps,
  current,
  label,
}: StepperProps<TStep>) {
  const currentIndex = steps.findIndex((step) => step.id === current);

  return (
    <nav aria-label={label} className="w-full">
      <ol className="flex items-center justify-between gap-2">
        {steps.map((step, index) => {
          const isComplete = index < currentIndex;
          const isCurrent = index === currentIndex;

          return (
            <li
              key={step.id}
              aria-current={isCurrent ? 'step' : undefined}
              className="flex flex-1 flex-col items-center gap-2"
            >
              <div className="flex w-full items-center">
                {index > 0 && (
                  <div
                    className={cn(
                      'h-0.5 flex-1',
                      isComplete || isCurrent ? 'bg-primary' : 'bg-muted'
                    )}
                  />
                )}
                <div
                  className={cn(
                    `flex h-8 w-8 shrink-0 items-center justify-center
                    rounded-full border-2 font-mono text-xs font-semibold`,
                    isComplete &&
                      'border-primary bg-primary text-primary-foreground',
                    isCurrent &&
                      'border-primary bg-primary/8 text-accent-strong',
                    !isComplete &&
                      !isCurrent &&
                      'border-border bg-card text-muted-foreground'
                  )}
                >
                  {isComplete ? (
                    <Check aria-hidden className="h-4 w-4" />
                  ) : (
                    index + 1
                  )}
                </div>
                {index < steps.length - 1 && (
                  <div
                    className={cn(
                      'h-0.5 flex-1',
                      index < currentIndex ? 'bg-primary' : 'bg-muted'
                    )}
                  />
                )}
              </div>
              <span
                className={cn(
                  'text-center text-xs font-medium',
                  isCurrent ? 'text-accent-strong' : 'text-muted-foreground'
                )}
              >
                {step.label}
              </span>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
