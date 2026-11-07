import {
  lazyRouteComponent,
  type RouteComponent,
} from '@tanstack/react-router';

/**
 * Default page loader: one lazy chunk per page.
 * The single-file build swaps this module for `page-loader.eager.ts`
 * (see the alias in vite.config.ts).
 */
const pages = import.meta.glob<Record<string, RouteComponent>>(
  '/src/modules/**/presentation/screens/*.screen.tsx'
);

export function pageComponent(path: string, exportName: string) {
  const importer = pages[path];
  if (!importer) {
    throw new Error(`Unknown page module: ${path}`);
  }
  return lazyRouteComponent(importer, exportName) as RouteComponent;
}
