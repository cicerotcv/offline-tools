import * as React from 'react';
import { useEffect, useState } from 'react';

import { type VariantProps } from 'class-variance-authority';
import { QrCode } from 'lucide-react';

import { renderQrDataUrl } from '@/shared/lib/qr';

import { cn } from '../../lib/utils';
import { buttonVariants } from './button';
import { Popover, PopoverContent, PopoverTrigger } from './popover';

interface QRCodeButtonProps
  extends Omit<React.ComponentProps<'button'>, 'onClick' | 'children'>,
    VariantProps<typeof buttonVariants> {
  value: string;
  label?: string;
  showLabel?: boolean;
  /**
   * Size of the QR code in pixels (default: 256)
   */
  qrSize?: number;
  /**
   * Optional label/title for the QR code popover
   */
  qrLabel?: string;
}

export function QRCodeButton({
  value,
  label = 'QR Code',
  showLabel = true,
  qrSize = 256,
  qrLabel,
  className,
  variant = 'outline',
  size = 'sm',
  ...props
}: QRCodeButtonProps) {
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  // Generate QR code when popover opens and data is available
  useEffect(() => {
    if (!isOpen || !value.trim()) {
      // Use setTimeout to avoid synchronous setState in effect
      const timeoutId = setTimeout(() => {
        setQrDataUrl(null);
      }, 0);
      return () => clearTimeout(timeoutId);
    }

    let cancelled = false;

    renderQrDataUrl(value, { width: qrSize })
      .then((url) => {
        if (!cancelled) {
          setQrDataUrl(url);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setQrDataUrl(null);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [value, isOpen, qrSize]);

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className={cn(buttonVariants({ variant, size }), 'gap-2', className)}
          {...props}
        >
          <QrCode className="h-4 w-4" />
          {showLabel && label}
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-4" align="center">
        <div className="space-y-3">
          {qrLabel && (
            <div className="text-center">
              <p className="text-sm font-medium text-foreground">{qrLabel}</p>
            </div>
          )}
          {qrDataUrl ? (
            <div
              className="flex items-center justify-center rounded-lg border
                border-border bg-card p-3"
            >
              <img
                src={qrDataUrl}
                alt="QR Code"
                className="max-w-full rounded"
                style={{ imageRendering: 'pixelated' }}
              />
            </div>
          ) : (
            <div
              className="flex h-64 w-64 items-center justify-center rounded-lg
                border border-border bg-muted"
            >
              <p className="text-xs text-muted-foreground">
                Generating QR code...
              </p>
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
