import { createRoute } from '@tanstack/react-router';

import { pageComponent } from '@/modules/navigation/lib/page-loader';
import { seoHead } from '@/modules/navigation/lib/seo-head';

import { toolsRoute } from './tools';

export const seedGenerationRoute = createRoute({
  getParentRoute: () => toolsRoute,
  path: '/seed-generation',
  head: seoHead('/tools/seed-generation'),
  component: pageComponent(
    '/src/modules/bip39-tool/presentation/screens/seed-generation.screen.tsx',
    'SeedGenerationScreen'
  ),
});
