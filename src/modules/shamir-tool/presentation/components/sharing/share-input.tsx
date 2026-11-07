import { FormSection } from '$/components/ui/form-section';
import { SecretTextarea } from '$/components/ui/secret-field';

interface ShareInputProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

export function ShareInput({
  value,
  onChange,
  disabled = false,
}: ShareInputProps) {
  return (
    <FormSection
      title="Shares"
      htmlFor="share-input"
      description="One share per line, in any order. Spaces inside a share are ignored, so a share typed from a printed card works."
    >
      <SecretTextarea
        id="share-input"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Paste at least M shares to recover the secret."
        className="min-h-32 font-mono text-sm"
        disabled={disabled}
      />
    </FormSection>
  );
}
