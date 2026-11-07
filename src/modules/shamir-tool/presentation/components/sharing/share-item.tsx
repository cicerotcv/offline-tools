import { CopyButton } from '$/components/ui/copy-button';
import { QRCodeButton } from '$/components/ui/qr-code-button';

interface ShareItemProps {
  share: string;
  index: number;
  total: number;
}

export function ShareItem({ share, index, total }: ShareItemProps) {
  return (
    <div className="flex items-start gap-3 rounded-lg bg-surface-inset p-3">
      <span
        aria-label={`Share ${index + 1} of ${total}`}
        className="mt-0.5 w-9 shrink-0 font-mono text-xs text-muted-foreground
          select-none"
      >
        {index + 1}/{total}
      </span>
      <p className="flex-1 font-mono text-sm break-all select-text">{share}</p>
      <div className="flex shrink-0 items-center gap-1">
        <QRCodeButton
          value={share}
          variant="ghost"
          size="icon-sm"
          showLabel={false}
          qrLabel={`Share ${index + 1} of ${total}`}
        />
        <CopyButton
          secret
          value={share}
          variant="ghost"
          size="icon-sm"
          showLabel={false}
        />
      </div>
    </div>
  );
}
