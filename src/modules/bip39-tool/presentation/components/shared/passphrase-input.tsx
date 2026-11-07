import { useState } from 'react';

import { Eye, EyeOff } from 'lucide-react';

import { Button } from '$/components/ui/button';
import { FormSection } from '$/components/ui/form-section';
import { SecretInput } from '$/components/ui/secret-field';

interface PassphraseInputProps {
  passphrase: string;
  onPassphraseChange: (passphrase: string) => void;
  id?: string;
  label?: string;
  description?: string;
}

/** Optional BIP39 passphrase (the "25th word"), masked by default. */
export function PassphraseInput({
  passphrase,
  onPassphraseChange,
  id = 'passphrase-input',
  label = 'Passphrase',
  description = 'Optional. With a passphrase, restoring the wallet needs both the words and the passphrase, and a forgotten passphrase cannot be recovered.',
}: PassphraseInputProps) {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <FormSection title={label} htmlFor={id} description={description}>
      <div className="relative">
        <SecretInput
          id={id}
          type={isVisible ? 'text' : 'password'}
          value={passphrase}
          onChange={(e) => onPassphraseChange(e.target.value)}
          className="pr-10"
        />
        {passphrase && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            aria-label={isVisible ? 'Hide passphrase' : 'Show passphrase'}
            onClick={() => setIsVisible(!isVisible)}
            className="absolute top-1/2 right-1 h-7 w-7 -translate-y-1/2 p-0"
          >
            {isVisible ? (
              <EyeOff aria-hidden className="h-4 w-4" />
            ) : (
              <Eye aria-hidden className="h-4 w-4" />
            )}
          </Button>
        )}
      </div>
    </FormSection>
  );
}
