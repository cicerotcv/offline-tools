import { type RouteComponent } from '@tanstack/react-router';

/**
 * Single-file page loader. With `inlineDynamicImports`, lazy pages are
 * appended after the render call, and the WASM top-level await suspends
 * evaluation before they are declared (TDZ errors). Importing every page
 * eagerly guarantees they are evaluated before the app renders.
 */
const pages = import.meta.glob<Record<string, RouteComponent>>(
  '/src/modules/**/presentation/screens/*.screen.tsx',
  { eager: true }
);

export function pageComponent(path: string, exportName: string) {
  const component = pages[path]?.[exportName];
  if (!component) {
    throw new Error(`Unknown page export: ${path}#${exportName}`);
  }
  return component;
}
