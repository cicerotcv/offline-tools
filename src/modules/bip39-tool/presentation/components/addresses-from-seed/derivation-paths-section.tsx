import { FormSection } from '$/components/ui/form-section';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '$/components/ui/tabs';

import type { DerivationPath } from '../../../domain/bitcoin/config';

interface DerivationPathsSectionProps {
  path: DerivationPath;
  onPathChange: (path: DerivationPath) => void;
  children: React.ReactNode;
  disabled?: boolean;
  disabledReason?: string;
}

interface PathInfo {
  name: string;
  format: string;
  addressPrefix: string;
  description: string;
}

const PATH_INFO: Record<DerivationPath, PathInfo> = {
  bip44: {
    name: 'BIP44',
    format: 'Legacy (P2PKH)',
    addressPrefix: "'1'",
    description: 'Most compatible with older wallets',
  },
  bip49: {
    name: 'BIP49',
    format: 'SegWit Wrapped (P2SH-P2WPKH)',
    addressPrefix: "'3'",
    description: 'Better fees than BIP44',
  },
  bip84: {
    name: 'BIP84',
    format: 'Native SegWit (P2WPKH)',
    addressPrefix: "'bc1'",
    description: 'Lowest fees, best for modern wallets',
  },
};

export function DerivationPathsSection({
  path,
  onPathChange,
  children,
  disabled = false,
  disabledReason,
}: DerivationPathsSectionProps) {
  const info = PATH_INFO[path];
  return (
    <FormSection
      title="Address type"
      description={
        disabled && disabledReason
          ? disabledReason
          : `${info.name}, ${info.format}: mainnet addresses start with ${info.addressPrefix}. ${info.description}.`
      }
    >
      <Tabs
        value={path}
        onValueChange={(v) => !disabled && onPathChange(v as DerivationPath)}
        className="gap-6"
      >
        <TabsList aria-label="Address type" className="grid w-full grid-cols-3">
          {(Object.keys(PATH_INFO) as DerivationPath[]).map((key) => (
            <TabsTrigger key={key} value={key} disabled={disabled}>
              {PATH_INFO[key].name}
            </TabsTrigger>
          ))}
        </TabsList>
        {(Object.keys(PATH_INFO) as DerivationPath[]).map((key) => (
          <TabsContent key={key} value={key}>
            {path === key && children}
          </TabsContent>
        ))}
      </Tabs>
    </FormSection>
  );
}
