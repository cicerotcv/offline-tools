import { useState } from 'react';

import { Checkbox } from '$/components/ui/checkbox';
import { Label } from '$/components/ui/label';

interface WordData {
  word: string;
  index: number | null;
  binary: string;
}

interface WordsDisplayProps {
  wordsData: WordData[];
}

export function WordsDisplay({ wordsData }: WordsDisplayProps) {
  const [showIndex, setShowIndex] = useState(false);
  const [showBinary, setShowBinary] = useState(false);

  if (wordsData.length === 0) {
    return null;
  }

  return (
    <div className="@container space-y-2">
      <div
        className="flex flex-col items-start justify-between gap-2 @sm:flex-row
          @sm:items-center"
      >
        <label className="text-sm font-medium text-foreground/80">Words</label>

        <div className="flex flex-row items-center gap-4">
          <div className="flex items-center gap-2">
            <Checkbox
              id="show-index"
              checked={showIndex}
              onCheckedChange={(checked) => setShowIndex(checked === true)}
            />
            <Label
              htmlFor="show-index"
              className="cursor-pointer text-sm font-normal
                text-muted-foreground"
            >
              Show index
            </Label>
          </div>

          <div className="flex items-center gap-2">
            <Checkbox
              id="show-binary"
              checked={showBinary}
              onCheckedChange={(checked) => setShowBinary(checked === true)}
            />
            <Label
              htmlFor="show-binary"
              className="cursor-pointer text-sm font-normal
                text-muted-foreground"
            >
              Show binary
            </Label>
          </div>
        </div>
      </div>
      <div className="rounded-lg border border-border bg-card p-4">
        <div className="grid grid-cols-2 gap-2 @sm:grid-cols-3 @lg:grid-cols-4">
          {wordsData.map((wordData, globalIndex) => {
            const isInvalid =
              wordData.word === 'INVALID' || wordData.index === null;
            return (
              <div
                key={globalIndex}
                data-invalid={isInvalid}
                className="relative min-w-0 rounded border p-2 text-center
                  data-[invalid='false']:border-border
                  data-[invalid='false']:bg-muted/50
                  data-[invalid='true']:border-destructive/40
                  data-[invalid='true']:bg-destructive/8 @sm:p-3"
              >
                <div
                  className="absolute top-1 left-1 text-xs font-normal
                    text-muted-foreground select-none"
                >
                  {globalIndex + 1}
                </div>
                <div className="space-y-1">
                  <div
                    data-invalid={isInvalid}
                    className="font-mono text-sm font-medium
                      data-[invalid='false']:text-foreground/80
                      data-[invalid='true']:text-destructive"
                  >
                    {wordData.word}
                  </div>
                  {showIndex && !isInvalid && wordData.index !== null && (
                    <div className="font-mono text-xs text-muted-foreground">
                      Index: {wordData.index}
                    </div>
                  )}
                  {showBinary && !isInvalid && (
                    <div
                      className="font-mono text-[10px] leading-tight break-all
                        text-muted-foreground"
                    >
                      {wordData.binary}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
