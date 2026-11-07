import { Card } from '@/shared/presentation/components/card';
import { MouseEntropyCollector } from '@/shared/presentation/components/mouse-entropy-collector';
import { PageContainer } from '@/shared/presentation/layouts/page';

import { Alert } from '$/components/ui/alert';
import { AdvancedOptions } from '$/components/ui/disclosure';

import {
  PasswordConfigComponent,
  PasswordExclusions,
} from '../components/password/password-config';
import { PasswordOutput } from '../components/password/password-output';
import { usePasswordGenerator } from '../hooks/password-generator';

export function PasswordGeneratorScreen() {
  const { config, setConfig, password, error, setMouseEntropy, generate } =
    usePasswordGenerator();

  return (
    <PageContainer className="pt-0 sm:pt-0">
      <Card>
        <div className="space-y-6">
          {error ? (
            <Alert variant="error" title="Cannot generate a password">
              {error}
            </Alert>
          ) : (
            password && (
              <PasswordOutput
                password={password}
                config={config}
                onRegenerate={generate}
              />
            )
          )}

          <PasswordConfigComponent config={config} onConfigChange={setConfig} />

          <AdvancedOptions>
            <PasswordExclusions config={config} onConfigChange={setConfig} />
            <MouseEntropyCollector
              onEntropyCollected={setMouseEntropy}
              disabled={false}
              label="Mouse entropy"
              description="Move the mouse in the area to mix extra randomness into the browser generator. The password regenerates when collection ends."
            />
          </AdvancedOptions>
        </div>
      </Card>
    </PageContainer>
  );
}
