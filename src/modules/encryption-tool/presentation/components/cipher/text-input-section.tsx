import { SecretTextarea } from '$/components/ui/secret-field';

interface TextInputSectionProps {
  value: string;
  onChange: (value: string) => void;
  operationMode: 'encrypt' | 'decrypt';
  disabled?: boolean;
}

export function TextInputSection({
  value,
  onChange,
  operationMode,
  disabled = false,
}: TextInputSectionProps) {
  const encrypt = operationMode === 'encrypt';
  return (
    <SecretTextarea
      id="text-input"
      aria-label={encrypt ? 'Text to encrypt' : 'Encrypted message (PGP armor)'}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={
        encrypt
          ? 'Type or paste the text to encrypt.'
          : 'Paste the message, from -----BEGIN PGP MESSAGE----- to the end.'
      }
      className="min-h-32 font-mono text-sm"
      disabled={disabled}
    />
  );
}
