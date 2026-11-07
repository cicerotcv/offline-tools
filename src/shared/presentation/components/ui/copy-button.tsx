import * as React from 'react';
import { useEffect, useRef, useState } from 'react';

import { type VariantProps } from 'class-variance-authority';
import { Check, Copy } from 'lucide-react';

import { cn } from '../../lib/utils';
import { buttonVariants } from './button';

export const SECRET_CLIPBOARD_TTL_MS = 30_000;

interface CopyButtonProps
  extends Omit<React.ComponentProps<'button'>, 'onClick' | 'children'>,
    VariantProps<typeof buttonVariants> {
  value: string;
  label?: string;
  onCopy?: () => void;
  showLabel?: boolean;
  /**
   * The value is a secret (seed, key, share, password): the clipboard is
   * cleared after SECRET_CLIPBOARD_TTL_MS and when the button unmounts,
   * but only if it still holds this value.
   */
  secret?: boolean;
}

/** Clears the clipboard if it still contains `value`; never throws. */
async function clearClipboardIfUnchanged(value: string) {
  try {
    if ((await navigator.clipboard.readText()) === value) {
      await navigator.clipboard.writeText('');
    }
  } catch {
    // Reading the clipboard needs permission; without it we cannot verify
    // the content, so we leave it untouched rather than erase user data.
  }
}

export function CopyButton({
  value,
  label = 'Copy',
  onCopy,
  showLabel = true,
  secret = false,
  className,
  variant = 'outline',
  size = 'sm',
  ...props
}: CopyButtonProps) {
  const [copied, setCopied] = useState(false);
  const clearTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const copiedValue = useRef<string | null>(null);

  useEffect(
    () => () => {
      if (clearTimer.current) clearTimeout(clearTimer.current);
      if (copiedValue.current !== null) {
        void clearClipboardIfUnchanged(copiedValue.current);
      }
    },
    []
  );

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      onCopy?.();

      if (secret) {
        copiedValue.current = value;
        if (clearTimer.current) clearTimeout(clearTimer.current);
        clearTimer.current = setTimeout(() => {
          void clearClipboardIfUnchanged(value);
          copiedValue.current = null;
        }, SECRET_CLIPBOARD_TTL_MS);
      }
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  return (
    <button
      type="button"
      onClick={handleCopy}
      title={
        secret && copied
          ? `Copied. The clipboard is cleared in ${SECRET_CLIPBOARD_TTL_MS / 1000}s.`
          : undefined
      }
      className={cn(buttonVariants({ variant, size }), 'gap-2', className)}
      {...props}
    >
      {copied ? (
        <Check className="h-4 w-4 text-success" />
      ) : (
        <Copy className="h-4 w-4" />
      )}
      {showLabel && label}
    </button>
  );
}
