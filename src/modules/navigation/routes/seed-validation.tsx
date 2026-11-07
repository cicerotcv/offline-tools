import { createRoute } from '@tanstack/react-router';

import { pageComponent } from '@/modules/navigation/lib/page-loader';
import { seoHead } from '@/modules/navigation/lib/seo-head';

import { toolsRoute } from './tools';

export const seedValidationRoute = createRoute({
  getParentRoute: () => toolsRoute,
  path: '/seed-validation',
  head: seoHead('/tools/seed-validation'),
  component: pageComponent(
    '/src/modules/bip39-tool/presentation/screens/seed-validation.screen.tsx',
    'SeedValidationScreen'
  ),
});
