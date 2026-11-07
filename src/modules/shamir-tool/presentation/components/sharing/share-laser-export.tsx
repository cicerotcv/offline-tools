import { useState } from 'react';

import { Download, Zap } from 'lucide-react';

import { Alert } from '$/components/ui/alert';
import { Button } from '$/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '$/components/ui/dialog';
import { downloadText } from '$/lib/download';

import { buildLaserPlate } from '../../../lib/laser';

interface ShareLaserExportProps {
  shares: string[];
  setId: string;
  threshold: number;
}

/**
 * Optional: one SVG per share for laser engraving on an ID-1 plate (front
 * and back, 1:1 in mm, black = engrave, red = cut). One file per click, so
 * shares never travel together.
 */
export function ShareLaserExport({
  shares,
  setId,
  threshold,
}: ShareLaserExportProps) {
  const [open, setOpen] = useState(false);
  const [saved, setSaved] = useState<Set<number>>(new Set());

  const save = (index: number) => {
    const { svg } = buildLaserPlate({
      share: shares[index],
      index,
      total: shares.length,
      threshold,
      setId,
    });
    downloadText(
      `share-${index + 1}-of-${shares.length}-set-${setId}.svg`,
      svg,
      'image/svg+xml'
    );
    setSaved((previous) => new Set(previous).add(index));
  };

  return (
    <>
      <Button variant="outline" size="sm" onClick={() => setOpen(true)}>
        <Zap aria-hidden className="h-4 w-4" />
        Export for laser
      </Button>
      <Dialog
        open={open}
        onOpenChange={(next) => {
          setOpen(next);
          if (!next) setSaved(new Set());
        }}
      >
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Export for laser engraving</DialogTitle>
            <DialogDescription>
              One SVG per share: front and back of a credit-card size plate
              (85.6 × 54 mm) at 1:1. Black is engraved, red is the cut line.
            </DialogDescription>
          </DialogHeader>

          <Alert variant="warning" title="Whoever engraves sees the share">
            Engrave them yourself, or use a different shop for each share. Never
            send {threshold} shares to the same place: together they open the
            secret.
          </Alert>

          <ul
            className="divide-y divide-border rounded-lg bg-surface-inset px-3"
          >
            {shares.map((_, index) => (
              <li
                key={index}
                className="flex items-center justify-between gap-3 py-2"
              >
                <span className="font-mono text-sm">
                  Share {index + 1}/{shares.length}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => save(index)}
                  aria-label={`Download share ${index + 1} SVG`}
                >
                  <Download aria-hidden className="h-4 w-4" />
                  {saved.has(index) ? 'Saved' : 'SVG'}
                </Button>
              </li>
            ))}
          </ul>

          <ol
            className="list-decimal space-y-1 pl-5 text-sm
              text-muted-foreground"
          >
            <li>
              Import at 100% scale; set black to line mode for text and fill for
              the QR, red to cut (or ignore it on a precut plate).
            </li>
            <li>
              Engrave the front, flip the plate along its outline, engrave the
              back.
            </li>
            <li>
              Stainless steel or titanium survive fire and water. Scan the QR
              once before storing the plate.
            </li>
          </ol>
        </DialogContent>
      </Dialog>
    </>
  );
}
