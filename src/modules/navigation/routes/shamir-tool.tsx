import { createRoute } from '@tanstack/react-router';

import { pageComponent } from '@/modules/navigation/lib/page-loader';
import { seoHead } from '@/modules/navigation/lib/seo-head';

import { toolsRoute } from './tools';

export const shamirToolRoute = createRoute({
  getParentRoute: () => toolsRoute,
  path: '/shamir',
  head: seoHead('/tools/shamir'),
  component: pageComponent(
    '/src/modules/shamir-tool/presentation/screens/shamir-tool.screen.tsx',
    'ShamirToolScreen'
  ),
});
