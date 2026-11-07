import { useState } from 'react';

import { Download } from 'lucide-react';

import { downloadText } from '$/lib/download';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from './alert-dialog';
import { Button } from './button';

interface SecretDownloadButtonProps {
  /** Evaluated when the user confirms (may include a timestamp). */
  filename: () => string;
  /** Built only when the user confirms, so the secret is not kept around. */
  content: () => string;
  /** What the file holds, for the dialog ("the account private key"). */
  subject: string;
  label?: string;
  size?: 'sm' | 'default' | 'icon-sm';
  showLabel?: boolean;
}

/**
 * Saving a secret to disk always asks first: files end up in backups,
 * sync folders and download histories.
 */
export function SecretDownloadButton({
  filename,
  content,
  subject,
  label = 'Download',
  size = 'sm',
  showLabel = true,
}: SecretDownloadButtonProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button
        type="button"
        variant="outline"
        size={size}
        onClick={() => setOpen(true)}
        aria-label={showLabel ? undefined : `${label} ${subject}`}
      >
        <Download aria-hidden className="h-4 w-4" />
        {showLabel && label}
      </Button>
      <AlertDialog open={open} onOpenChange={setOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Save {subject} to a file?</AlertDialogTitle>
            <AlertDialogDescription>
              The file is plain text. Anyone who opens it can spend the funds.
              Save it only to offline, encrypted storage, never to a synced
              folder or an email.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                downloadText(filename(), content());
                setOpen(false);
              }}
            >
              Save file
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
