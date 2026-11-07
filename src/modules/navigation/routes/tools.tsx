import { createRoute, Outlet, useLocation } from '@tanstack/react-router';

import {
  SelfTestGate,
  useSelfTest,
} from '@/shared/presentation/components/self-test-gate';
import { ToolGuide } from '@/shared/presentation/components/tool-guide';
import { ToolStatus } from '@/shared/presentation/components/tool-status';
import {
  PageContainer,
  PageDescription,
  PageTitle,
} from '@/shared/presentation/layouts/page';
import { TOOLS } from '@/shared/presentation/tools/tool-registry';

import { pageComponent } from '@/modules/navigation/lib/page-loader';
import { SELF_TESTS } from '@/modules/navigation/lib/self-tests';
import { seoHead } from '@/modules/navigation/lib/seo-head';
import { Navbar } from '@/modules/navigation/presentation/components/navbar';
import { ToolNotFound } from '@/modules/navigation/presentation/components/route-fallbacks';
import { SiteFooter } from '@/modules/navigation/presentation/components/site-footer';
import { AppSidebar } from '@/modules/tools/presentation/components/catalog/app-sidebar';

import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from '$/components/ui/sidebar';

import { rootRoute } from './root';

// Tools layout route - wraps all tool pages with sidebar
export const toolsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/tools',
  component: ToolsLayout,
  notFoundComponent: ToolNotFound,
});

function ToolsLayout() {
  const { pathname } = useLocation();
  const tool = TOOLS.find((t) => pathname.startsWith(t.path));
  const selfTest = useSelfTest(tool ? SELF_TESTS[tool.id] : undefined);

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <Navbar />
        <main id="main" className="flex-1">
          <div className="mx-auto max-w-7xl px-4 pt-4 sm:px-6 lg:px-8">
            <SidebarTrigger className="-ml-2 text-muted-foreground" />
          </div>
          {tool ? (
            <>
              <PageContainer className="pb-8 sm:pb-8">
                <PageTitle>{tool.heading}</PageTitle>
                <PageDescription>{tool.description}</PageDescription>
                <ToolStatus
                  selfTest={selfTest}
                  sensitive={tool.sensitivity === 'secret'}
                />
              </PageContainer>
              <SelfTestGate state={selfTest}>
                <Outlet />
              </SelfTestGate>
              <PageContainer className="pt-0 sm:pt-0">
                <ToolGuide id={tool.id} />
              </PageContainer>
            </>
          ) : (
            <Outlet />
          )}
        </main>
        <SiteFooter />
      </SidebarInset>
    </SidebarProvider>
  );
}

// Tools index route - the main tools listing page
export const toolsIndexRoute = createRoute({
  getParentRoute: () => toolsRoute,
  path: '/',
  head: seoHead('/tools'),
  component: pageComponent(
    '/src/modules/tools/presentation/screens/tools.screen.tsx',
    'ToolsScreen'
  ),
});
