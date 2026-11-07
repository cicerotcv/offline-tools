import { Buffer } from 'buffer';
import { createRoot } from 'react-dom/client';
import 'setimmediate';

import { STATIC_HEAD_ATTRIBUTE } from '@/shared/presentation/seo/route-head';

import { NavigationProvider } from '@/modules/navigation/router';

import './global.css';

// Make Buffer available globally for browser compatibility
if (typeof window !== 'undefined') {
  (window as typeof window & { Buffer: typeof Buffer }).Buffer = Buffer;
}
if (typeof globalThis !== 'undefined') {
  (globalThis as typeof globalThis & { Buffer: typeof Buffer }).Buffer = Buffer;
}

// Prerendered pages ship static head tags for crawlers; at runtime the
// router's HeadContent owns <head>, so drop them to avoid stale duplicates.
document
  .querySelectorAll(`[${STATIC_HEAD_ATTRIBUTE}]`)
  .forEach((node) => node.remove());

const rootElement = document.getElementById('root')!;

createRoot(rootElement).render(<NavigationProvider />);
