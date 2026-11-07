import { useState } from 'react';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '$/components/ui/tabs';

import { FromTinySeedMode } from './from-tinyseed-mode';
import { FromWordsMode } from './from-words-mode';

type Mode = 'from-words' | 'from-tinyseed';

export function TinySeedForm() {
  const [mode, setMode] = useState<Mode>('from-words');

  return (
    <div className="space-y-6">
      <Tabs value={mode} onValueChange={(value) => setMode(value as Mode)}>
        <TabsList aria-label="Direction" className="grid w-full grid-cols-2">
          <TabsTrigger value="from-words">Words to grid</TabsTrigger>
          <TabsTrigger value="from-tinyseed">Grid to words</TabsTrigger>
        </TabsList>

        <TabsContent value="from-words" className="mt-6 space-y-4">
          <FromWordsMode />
        </TabsContent>

        <TabsContent value="from-tinyseed" className="mt-6 space-y-4">
          <FromTinySeedMode />
        </TabsContent>
      </Tabs>
    </div>
  );
}
