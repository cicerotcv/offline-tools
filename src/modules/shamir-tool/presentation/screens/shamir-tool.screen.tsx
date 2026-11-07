import { useState } from 'react';

import { Card } from '@/shared/presentation/components/card';
import { PageContainer } from '@/shared/presentation/layouts/page';

import { Disclosure } from '$/components/ui/disclosure';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '$/components/ui/tabs';

import { ReconstructMode } from '../components/sharing/modes/reconstruct-mode';
import { SplitMode } from '../components/sharing/modes/split-mode';

type Mode = 'split' | 'reconstruct';

export function ShamirToolScreen() {
  const [mode, setMode] = useState<Mode>('split');

  return (
    <PageContainer className="pt-0 sm:pt-0">
      <div className="space-y-6">
        <Card>
          <Tabs value={mode} onValueChange={(value) => setMode(value as Mode)}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="split">Split</TabsTrigger>
              <TabsTrigger value="reconstruct">Reconstruct</TabsTrigger>
            </TabsList>

            <TabsContent value="split" className="mt-6 space-y-4">
              <SplitMode />
            </TabsContent>

            <TabsContent value="reconstruct" className="mt-6 space-y-4">
              <ReconstructMode />
            </TabsContent>
          </Tabs>
        </Card>

        <Disclosure title="How the shares work">
          <dl
            className="grid max-w-[75ch] gap-4 text-sm text-muted-foreground
              sm:grid-cols-2"
          >
            <div>
              <dt className="font-medium text-foreground">
                Encrypt, then split
              </dt>
              <dd className="mt-1">
                The secret is encrypted with a random 256-bit key and only the
                key is split, with Shamir interpolation over GF(256). Every
                share carries the encrypted payload.
              </dd>
            </div>
            <div>
              <dt className="font-medium text-foreground">
                Fewer than M shares
              </dt>
              <dd className="mt-1">
                They rebuild a wrong key, so the output is unreadable noise,
                never part of the secret.
              </dd>
            </div>
            <div>
              <dt className="font-medium text-foreground">Share format v2</dt>
              <dd className="mt-1">
                A URL-safe base64 string with the threshold, the total, the
                share index, the key part, the nonce and the ciphertext. Shares
                from earlier versions are not compatible.
              </dd>
            </div>
          </dl>
        </Disclosure>
      </div>
    </PageContainer>
  );
}
