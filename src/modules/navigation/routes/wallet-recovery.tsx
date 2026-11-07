import { createRoute } from '@tanstack/react-router';

import { pageComponent } from '@/modules/navigation/lib/page-loader';
import { seoHead } from '@/modules/navigation/lib/seo-head';

import { toolsRoute } from './tools';

export const walletRecoveryRoute = createRoute({
  getParentRoute: () => toolsRoute,
  path: '/wallet-recovery',
  head: seoHead('/tools/wallet-recovery'),
  component: pageComponent(
    '/src/modules/bip39-tool/presentation/screens/wallet-recovery.screen.tsx',
    'WalletRecoveryScreen'
  ),
});
