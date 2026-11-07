import { Label } from '$/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '$/components/ui/select';

import type { AddressType } from '../../hooks/paper-wallet';

interface AddressTypeSelectorProps {
  value: AddressType;
  onChange: (value: AddressType) => void;
  disabled?: boolean;
}

const ADDRESS_TYPES: {
  value: AddressType;
  label: string;
  description: string;
}[] = [
  {
    value: 'native',
    label: 'Native SegWit (BIP84), bc1…',
    description:
      'Lowest fees, modern standard. Recommended for new paper wallets.',
  },
  {
    value: 'segwit',
    label: 'P2SH-SegWit (BIP49), 3…',
    description:
      'SegWit wrapped in P2SH. Compatible with older wallets and services.',
  },
  {
    value: 'legacy',
    label: 'Legacy (BIP44), 1…',
    description:
      'Original Bitcoin address format. Higher fees; use only when required.',
  },
];

export function AddressTypeSelector({
  value,
  onChange,
  disabled = false,
}: AddressTypeSelectorProps) {
  const selected = ADDRESS_TYPES.find((t) => t.value === value)!;

  return (
    <div className="space-y-2">
      <Label htmlFor="address-type" className="text-sm font-medium">
        Address type
      </Label>
      <Select
        value={value}
        onValueChange={(val) => onChange(val as AddressType)}
        disabled={disabled}
      >
        <SelectTrigger id="address-type" className="w-full">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {ADDRESS_TYPES.map((type) => (
            <SelectItem key={type.value} value={type.value}>
              {type.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <p className="text-xs text-muted-foreground">{selected.description}</p>
    </div>
  );
}
