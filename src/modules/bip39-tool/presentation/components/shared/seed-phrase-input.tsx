import { Label } from '$/components/ui/label';
import { SecretTextarea } from '$/components/ui/secret-field';
import { cn } from '$/lib/utils';

import { AutocompleteTextarea } from './autocomplete-textarea';

interface SeedPhraseInputProps {
  // Input state
  value: string;
  onChange: (value: string) => void;

  // Optional customization
  id?: string;
  label?: string;
  placeholder?: string;
  helpText?: string;

  // Features
  enableAutocomplete?: boolean; // Default: true
  showWordCount?: boolean; // Default: true
  disabled?: boolean;

  // Styling
  className?: string;
}

export function SeedPhraseInput({
  value,
  onChange,
  id = 'seed-phrase',
  label = 'Seed phrase',
  placeholder = 'The 12 to 24 words, separated by spaces.',
  helpText = 'Words autocomplete from the BIP39 English wordlist.',
  enableAutocomplete = true,
  showWordCount = true,
  disabled = false,
  className = '',
}: SeedPhraseInputProps) {
  const wordCount = value
    .trim()
    .split(/\s+/)
    .filter((w) => w.length > 0).length;

  return (
    <div className="space-y-2">
      <Label htmlFor={id} className="text-sm font-medium">
        {label}
      </Label>

      <div className="relative">
        {enableAutocomplete ? (
          <AutocompleteTextarea
            id={id}
            placeholder={placeholder}
            value={value}
            onChange={onChange}
            className={cn('min-h-32 font-mono text-sm', className)}
          />
        ) : (
          <SecretTextarea
            id={id}
            placeholder={placeholder}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            disabled={disabled}
            className={cn('min-h-32 font-mono text-sm', className)}
          />
        )}

        {showWordCount && wordCount > 0 && (
          <div
            className="pointer-events-none absolute right-2 bottom-2 rounded
              px-2 py-1 font-mono text-xs text-muted-foreground"
          >
            {wordCount} {wordCount === 1 ? 'word' : 'words'}
          </div>
        )}
      </div>

      {helpText && <p className="text-xs text-muted-foreground">{helpText}</p>}
    </div>
  );
}
