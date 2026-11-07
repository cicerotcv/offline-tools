interface QRCodeDisplayProps {
  qrDataUrl: string | null;
}

export function QRCodeDisplay({ qrDataUrl }: QRCodeDisplayProps) {
  if (!qrDataUrl) {
    return (
      <div
        className="flex min-h-64 items-center justify-center rounded-lg border
          border-border bg-muted"
      >
        <p className="text-sm text-muted-foreground">
          The code appears here as you type.
        </p>
      </div>
    );
  }

  return (
    <div
      className="flex items-center justify-center rounded-lg border
        border-border bg-card p-4"
    >
      <img
        src={qrDataUrl}
        alt="Generated QR code"
        className="max-w-full rounded"
        style={{ imageRendering: 'pixelated' }}
      />
    </div>
  );
}
