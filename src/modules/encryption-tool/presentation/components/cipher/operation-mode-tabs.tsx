import { Lock, Unlock } from 'lucide-react';

import { Tabs, TabsList, TabsTrigger } from '$/components/ui/tabs';

type OperationMode = 'encrypt' | 'decrypt';

interface OperationModeTabsProps {
  operationMode: OperationMode;
  onOperationModeChange: (mode: OperationMode) => void;
  disabled?: boolean;
}

export function OperationModeTabs({
  operationMode,
  onOperationModeChange,
  disabled = false,
}: OperationModeTabsProps) {
  return (
    <Tabs
      value={operationMode}
      onValueChange={(value) => onOperationModeChange(value as OperationMode)}
    >
      <TabsList aria-label="Operation" className="grid w-full grid-cols-2">
        <TabsTrigger value="encrypt" disabled={disabled}>
          <Lock aria-hidden />
          Encrypt
        </TabsTrigger>
        <TabsTrigger value="decrypt" disabled={disabled}>
          <Unlock aria-hidden />
          Decrypt
        </TabsTrigger>
      </TabsList>
    </Tabs>
  );
}
