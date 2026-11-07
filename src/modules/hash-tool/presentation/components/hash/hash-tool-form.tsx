import { useState } from 'react';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '$/components/ui/tabs';

import { type Algorithm, type HashCase } from '../../../domain/hash/algorithm';
import { useHashInput } from '../../hooks/hash-input';
import { AlgorithmSelector } from './algorithm-selector';
import { ComputeMode } from './modes/compute-mode';
import { VerifyMode } from './modes/verify-mode';

type ToolMode = 'compute' | 'verify';

export function HashToolForm() {
  const [toolMode, setToolMode] = useState<ToolMode>('compute');
  const [algorithm, setAlgorithm] = useState<Algorithm>('sha256');
  const [hashCase, setHashCase] = useState<HashCase>('lower');

  const hashInput = useHashInput(algorithm);

  return (
    <Tabs
      value={toolMode}
      onValueChange={(value) => setToolMode(value as ToolMode)}
      className="gap-6"
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <TabsList aria-label="Mode">
          <TabsTrigger value="compute" className="px-4">
            Compute
          </TabsTrigger>
          <TabsTrigger value="verify" className="px-4">
            Verify
          </TabsTrigger>
        </TabsList>
        <AlgorithmSelector
          algorithm={algorithm}
          onAlgorithmChange={setAlgorithm}
          disabled={hashInput.isProcessing}
        />
      </div>

      <TabsContent value="compute" className="space-y-6">
        <ComputeMode
          algorithm={algorithm}
          hashCase={hashCase}
          onHashCaseChange={setHashCase}
          input={hashInput}
        />
      </TabsContent>

      <TabsContent value="verify" className="space-y-6">
        <VerifyMode algorithm={algorithm} input={hashInput} />
      </TabsContent>
    </Tabs>
  );
}
