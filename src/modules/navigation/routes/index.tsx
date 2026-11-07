import { createRoute } from '@tanstack/react-router';

import { LandingScreen } from '@/modules/lp/presentation/screens/landing.screen';
import { seoHead } from '@/modules/navigation/lib/seo-head';
import { Navbar } from '@/modules/navigation/presentation/components/navbar';
import { SiteFooter } from '@/modules/navigation/presentation/components/site-footer';

import { rootRoute } from './root';

export const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  head: seoHead('/'),
  component: IndexLayout,
});

function IndexLayout() {
  return (
    <>
      <Navbar />
      <main id="main">
        <LandingScreen />
      </main>
      <SiteFooter />
    </>
  );
}
