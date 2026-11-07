import { createRoute } from '@tanstack/react-router';

import { pageComponent } from '@/modules/navigation/lib/page-loader';
import { seoHead } from '@/modules/navigation/lib/seo-head';

import { toolsRoute } from './tools';

export const paperWalletRoute = createRoute({
  getParentRoute: () => toolsRoute,
  path: '/paper-wallet',
  head: seoHead('/tools/paper-wallet'),
  component: pageComponent(
    '/src/modules/bip39-tool/presentation/screens/paper-wallet.screen.tsx',
    'PaperWalletScreen'
  ),
});
