import { createRootRoute, HeadContent, Outlet } from '@tanstack/react-router';
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools';

import { ThemeProvider } from '@/shared/presentation/providers/theme-provider';

import { PageNotFound } from '@/modules/navigation/presentation/components/route-fallbacks';

export const rootRoute = createRootRoute({
  component: RootComponent,
  notFoundComponent: PageNotFound,
});

function RootComponent() {
  return (
    <ThemeProvider>
      <HeadContent />
      <a
        href="#main"
        className="sr-only z-50 rounded-md bg-primary px-4 py-2 text-sm
          font-medium text-primary-foreground focus:not-sr-only focus:fixed
          focus:top-3 focus:left-3"
      >
        Skip to content
      </a>
      <div className="min-h-dvh bg-background text-foreground">
        <Outlet />
      </div>
      {import.meta.env.DEV && <TanStackRouterDevtools />}
    </ThemeProvider>
  );
}
