import { createRoute } from '@tanstack/react-router';

import { pageComponent } from '@/modules/navigation/lib/page-loader';
import { seoHead } from '@/modules/navigation/lib/seo-head';

import { toolsRoute } from './tools';

export const encryptionToolRoute = createRoute({
  getParentRoute: () => toolsRoute,
  path: '/encryption',
  head: seoHead('/tools/encryption'),
  component: pageComponent(
    '/src/modules/encryption-tool/presentation/screens/encryption-tool.screen.tsx',
    'EncryptionToolScreen'
  ),
});
