import { Tabs, TabsList, TabsTrigger } from '$/components/ui/tabs';

import {
  type Algorithm,
  ALGORITHM_LABELS,
  ALGORITHMS,
} from '../../../domain/hash/algorithm';

interface AlgorithmSelectorProps {
  algorithm: Algorithm;
  onAlgorithmChange: (algorithm: Algorithm) => void;
  disabled?: boolean;
}

export function AlgorithmSelector({
  algorithm,
  onAlgorithmChange,
  disabled = false,
}: AlgorithmSelectorProps) {
  return (
    <div className="flex flex-col items-end gap-2">
      <Tabs
        value={algorithm}
        onValueChange={(value) => onAlgorithmChange(value as Algorithm)}
      >
        <TabsList aria-label="Algorithm">
          {Object.values(ALGORITHMS).map((algo) => (
            <TabsTrigger key={algo} value={algo} disabled={disabled}>
              {ALGORITHM_LABELS[algo]}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>
      {algorithm === 'md5' && (
        <p className="max-w-xs text-right text-xs text-warning">
          MD5 is legacy: use it only to match an old checksum.
        </p>
      )}
    </div>
  );
}
