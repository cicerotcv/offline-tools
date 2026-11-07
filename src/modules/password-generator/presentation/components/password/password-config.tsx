import { Checkbox } from '$/components/ui/checkbox';
import { FormSection } from '$/components/ui/form-section';
import { Label } from '$/components/ui/label';
import { Slider } from '$/components/ui/slider';

import {
  MAX_PASSWORD_LENGTH,
  MIN_PASSWORD_LENGTH,
} from '../../../domain/password/password-config';
import type { PasswordConfig } from '../../../domain/password/password-config';

type BooleanKey = {
  [K in keyof PasswordConfig]: PasswordConfig[K] extends boolean ? K : never;
}[keyof PasswordConfig];

const CHARACTER_SETS: { key: BooleanKey; label: string }[] = [
  { key: 'includeUppercase', label: 'Uppercase (A-Z)' },
  { key: 'includeLowercase', label: 'Lowercase (a-z)' },
  { key: 'includeNumbers', label: 'Numbers (0-9)' },
  { key: 'includeSymbols', label: 'Symbols (!@#$%…)' },
];

const EXCLUSIONS: { key: BooleanKey; label: string }[] = [
  { key: 'excludeSimilar', label: 'Exclude look-alikes (i l 1 L o 0 O)' },
  {
    key: 'excludeAmbiguous',
    label: 'Exclude ambiguous symbols ({ } [ ] ( ) / \\ \' " ` ~ , ; : . < >)',
  },
];

interface PasswordConfigProps {
  config: PasswordConfig;
  onConfigChange: (config: PasswordConfig) => void;
  disabled?: boolean;
}

function CheckboxList({
  items,
  config,
  onChange,
  disabled,
  columns,
}: {
  items: { key: BooleanKey; label: string }[];
  config: PasswordConfig;
  onChange: (key: BooleanKey, value: boolean) => void;
  disabled: boolean;
  columns?: boolean;
}) {
  return (
    <div className={columns ? 'grid gap-2 sm:grid-cols-2' : 'space-y-2'}>
      {items.map(({ key, label }) => (
        <div key={key} className="flex items-center gap-2">
          <Checkbox
            id={key}
            checked={config[key]}
            onCheckedChange={(checked) => onChange(key, checked === true)}
            disabled={disabled}
          />
          <Label
            htmlFor={key}
            className="cursor-pointer text-sm font-normal text-muted-foreground"
          >
            {label}
          </Label>
        </div>
      ))}
    </div>
  );
}

/** Length and character sets: the settings most people change. */
export function PasswordConfigComponent({
  config,
  onConfigChange,
  disabled = false,
}: PasswordConfigProps) {
  const update = (key: BooleanKey, value: boolean) =>
    onConfigChange({ ...config, [key]: value });

  return (
    <div className="space-y-6">
      <FormSection
        title={`Length: ${config.length} characters`}
        htmlFor="password-length"
      >
        <Slider
          id="password-length"
          value={[config.length]}
          onValueChange={([value]) =>
            onConfigChange({ ...config, length: value })
          }
          min={MIN_PASSWORD_LENGTH}
          max={MAX_PASSWORD_LENGTH}
          step={1}
          disabled={disabled}
          aria-valuetext={`${config.length} characters`}
        />
      </FormSection>

      <FormSection title="Characters">
        <CheckboxList
          items={CHARACTER_SETS}
          config={config}
          onChange={update}
          disabled={disabled}
          columns
        />
      </FormSection>
    </div>
  );
}

/** Exclusions, kept under Advanced options. */
export function PasswordExclusions({
  config,
  onConfigChange,
  disabled = false,
}: PasswordConfigProps) {
  return (
    <FormSection title="Exclusions">
      <CheckboxList
        items={EXCLUSIONS}
        config={config}
        onChange={(key, value) => onConfigChange({ ...config, [key]: value })}
        disabled={disabled}
      />
    </FormSection>
  );
}
