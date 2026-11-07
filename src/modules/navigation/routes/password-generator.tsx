import { createRoute } from '@tanstack/react-router';

import { pageComponent } from '@/modules/navigation/lib/page-loader';
import { seoHead } from '@/modules/navigation/lib/seo-head';

import { toolsRoute } from './tools';

export const passwordGeneratorRoute = createRoute({
  getParentRoute: () => toolsRoute,
  path: '/password-generator',
  head: seoHead('/tools/password-generator'),
  component: pageComponent(
    '/src/modules/password-generator/presentation/screens/password-generator.screen.tsx',
    'PasswordGeneratorScreen'
  ),
});
