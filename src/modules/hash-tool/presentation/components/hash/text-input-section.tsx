import { SecretTextarea } from '$/components/ui/secret-field';

interface TextInputSectionProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

function formatByteCount(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function TextInputSection({
  value,
  onChange,
  disabled = false,
}: TextInputSectionProps) {
  const byteCount = new TextEncoder().encode(value).byteLength;

  return (
    <div className="space-y-1.5">
      <SecretTextarea
        id="text-input"
        aria-label="Text to hash"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Type or paste text. The digest updates as you type."
        className="min-h-32 font-mono text-sm"
        disabled={disabled}
      />
      {value.length > 0 && (
        <p className="text-xs text-muted-foreground">
          {value.length} chars · {formatByteCount(byteCount)} UTF-8
        </p>
      )}
    </div>
  );
}
