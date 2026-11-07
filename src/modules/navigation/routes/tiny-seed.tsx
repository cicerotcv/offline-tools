import { createRoute } from '@tanstack/react-router';

import { pageComponent } from '@/modules/navigation/lib/page-loader';
import { seoHead } from '@/modules/navigation/lib/seo-head';

import { toolsRoute } from './tools';

export const tinySeedRoute = createRoute({
  getParentRoute: () => toolsRoute,
  path: '/tiny-seed',
  head: seoHead('/tools/tiny-seed'),
  component: pageComponent(
    '/src/modules/bip39-tool/presentation/screens/tiny-seed.screen.tsx',
    'TinySeedScreen'
  ),
});
