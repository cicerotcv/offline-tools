import { useState } from 'react';

import { Eye, EyeOff } from 'lucide-react';

import { Button } from '$/components/ui/button';
import { FormSection } from '$/components/ui/form-section';
import { SecretInput } from '$/components/ui/secret-field';

interface KeyInputSectionProps {
  value: string;
  onChange: (value: string) => void;
  operationMode: 'encrypt' | 'decrypt';
  disabled?: boolean;
}

export function KeyInputSection({
  value,
  onChange,
  operationMode,
  disabled = false,
}: KeyInputSectionProps) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <FormSection
      title="Password"
      htmlFor="key-input"
      description={
        operationMode === 'encrypt'
          ? 'Anyone with this password can decrypt. There is no recovery if you lose it.'
          : 'The exact password used to encrypt; it is case-sensitive.'
      }
    >
      <div className="relative">
        <SecretInput
          id="key-input"
          type={showPassword ? 'text' : 'password'}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="pr-10"
          disabled={disabled}
        />
        <Button
          type="button"
          variant="ghost"
          size="sm"
          aria-label={showPassword ? 'Hide password' : 'Show password'}
          className="absolute top-0 right-0 h-full px-3 hover:bg-transparent"
          onClick={() => setShowPassword(!showPassword)}
          disabled={disabled}
        >
          {showPassword ? (
            <EyeOff aria-hidden className="h-4 w-4 text-muted-foreground" />
          ) : (
            <Eye aria-hidden className="h-4 w-4 text-muted-foreground" />
          )}
        </Button>
      </div>
    </FormSection>
  );
}
