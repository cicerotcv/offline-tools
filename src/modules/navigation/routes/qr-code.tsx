import { createRoute } from '@tanstack/react-router';

import { pageComponent } from '@/modules/navigation/lib/page-loader';
import { seoHead } from '@/modules/navigation/lib/seo-head';

import { toolsRoute } from './tools';

export const qrCodeRoute = createRoute({
  getParentRoute: () => toolsRoute,
  path: '/qr-code',
  head: seoHead('/tools/qr-code'),
  component: pageComponent(
    '/src/modules/qr-code/presentation/screens/qr-code.screen.tsx',
    'QRCodeScreen'
  ),
});
