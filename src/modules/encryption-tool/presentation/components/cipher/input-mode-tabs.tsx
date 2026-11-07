import { FileText, Upload } from 'lucide-react';

import { Tabs, TabsList, TabsTrigger } from '$/components/ui/tabs';

type InputMode = 'text' | 'file';

interface InputModeTabsProps {
  inputMode: InputMode;
  onInputModeChange: (mode: InputMode) => void;
  disabled?: boolean;
}

export function InputModeTabs({
  inputMode,
  onInputModeChange,
  disabled = false,
}: InputModeTabsProps) {
  return (
    <Tabs
      value={inputMode}
      onValueChange={(value) => onInputModeChange(value as InputMode)}
    >
      <TabsList aria-label="Input" className="grid w-full grid-cols-2">
        <TabsTrigger value="text" disabled={disabled}>
          <FileText aria-hidden />
          Text
        </TabsTrigger>
        <TabsTrigger value="file" disabled={disabled}>
          <Upload aria-hidden />
          File
        </TabsTrigger>
      </TabsList>
    </Tabs>
  );
}
