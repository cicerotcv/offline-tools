import * as React from 'react';

import { Input } from './input';
import { Textarea } from './textarea';

/**
 * Attributes that keep secrets (seeds, keys, shares, passphrases) away from
 * spellcheck services, autofill, autocorrect and password managers.
 */
export const SECRET_FIELD_ATTRIBUTES = {
  spellCheck: false,
  autoComplete: 'off',
  autoCorrect: 'off',
  autoCapitalize: 'off',
  'data-1p-ignore': true,
  'data-lpignore': 'true',
  'data-form-type': 'other',
} as const;

/** Input for secret values. Same API as Input, with secret hygiene applied. */
export function SecretInput(props: React.ComponentProps<typeof Input>) {
  return <Input {...SECRET_FIELD_ATTRIBUTES} {...props} />;
}

/** Textarea for secret values. Same API as Textarea, with secret hygiene applied. */
export function SecretTextarea(props: React.ComponentProps<typeof Textarea>) {
  return <Textarea {...SECRET_FIELD_ATTRIBUTES} {...props} />;
}
