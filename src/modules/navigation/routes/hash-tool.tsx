import { createRoute } from '@tanstack/react-router';

import { pageComponent } from '@/modules/navigation/lib/page-loader';
import { seoHead } from '@/modules/navigation/lib/seo-head';

import { toolsRoute } from './tools';

export const hashToolRoute = createRoute({
  getParentRoute: () => toolsRoute,
  path: '/hash',
  head: seoHead('/tools/hash'),
  component: pageComponent(
    '/src/modules/hash-tool/presentation/screens/hash-tool.screen.tsx',
    'HashToolScreen'
  ),
});
