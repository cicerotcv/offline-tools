import { FormSection } from '$/components/ui/form-section';
import { Input } from '$/components/ui/input';
import { Tabs, TabsList, TabsTrigger } from '$/components/ui/tabs';

interface AddressCountInputProps {
  count: number;
  onCountChange: (count: number) => void;
}

const PRESET_COUNTS = [5, 10, 25, 50, 100] as const;
const MAX_ADDRESS_COUNT = 1000;
const MIN_ADDRESS_COUNT = 1;

export function AddressCountInput({
  count,
  onCountChange,
}: AddressCountInputProps) {
  const handleCustomInput = (value: string) => {
    const num = parseInt(value, 10);
    if (!isNaN(num) && num >= MIN_ADDRESS_COUNT && num <= MAX_ADDRESS_COUNT) {
      onCountChange(num);
    }
  };

  const isPreset = (PRESET_COUNTS as readonly number[]).includes(count);
  return (
    <FormSection title="Addresses per chain" htmlFor="custom-count">
      <div className="flex items-center gap-2">
        <Tabs
          value={isPreset ? String(count) : ''}
          onValueChange={(v) => onCountChange(Number(v))}
          className="flex-1"
        >
          <TabsList
            aria-label="Preset counts"
            className="grid w-full grid-cols-5"
          >
            {PRESET_COUNTS.map((preset) => (
              <TabsTrigger
                key={preset}
                value={String(preset)}
                className="font-mono"
              >
                {preset}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
        <Input
          id="custom-count"
          type="number"
          min={MIN_ADDRESS_COUNT}
          max={MAX_ADDRESS_COUNT}
          value={count}
          onChange={(e) => handleCustomInput(e.target.value)}
          aria-label={`Custom count, 1 to ${MAX_ADDRESS_COUNT}`}
          className="w-20 font-mono text-sm"
        />
      </div>
    </FormSection>
  );
}
