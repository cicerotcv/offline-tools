import { useState } from 'react';

import { Card } from '@/shared/presentation/components/card';
import { PageContainer } from '@/shared/presentation/layouts/page';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '$/components/ui/tabs';

import { GenerateMode } from '../components/qr/modes/generate-mode';
import { ScanMode } from '../components/qr/modes/scan-mode';

type Mode = 'generate' | 'scan';

export function QRCodeScreen() {
  const [mode, setMode] = useState<Mode>('generate');
  return (
    <PageContainer className="pt-0 sm:pt-0">
      <Card>
        <Tabs value={mode} onValueChange={(value) => setMode(value as Mode)}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="generate">Generate</TabsTrigger>
            <TabsTrigger value="scan">Scan</TabsTrigger>
          </TabsList>

          <TabsContent value="generate" className="mt-6 space-y-4">
            <GenerateMode />
          </TabsContent>

          <TabsContent value="scan" className="mt-6 space-y-4">
            <ScanMode />
          </TabsContent>
        </Tabs>
      </Card>
    </PageContainer>
  );
}
