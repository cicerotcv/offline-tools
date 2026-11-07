import {
  createHashHistory,
  createRouter,
  RouterProvider,
} from '@tanstack/react-router';

import { RouteErrorFallback } from './presentation/components/route-fallbacks';
import { encryptionToolRoute } from './routes/encryption-tool';
import { hashToolRoute } from './routes/hash-tool';
import { indexRoute } from './routes/index';
import { paperWalletRoute } from './routes/paper-wallet';
import { passwordGeneratorRoute } from './routes/password-generator';
import { qrCodeRoute } from './routes/qr-code';
import { rootRoute } from './routes/root';
import { seedGenerationRoute } from './routes/seed-generation';
import { seedValidationRoute } from './routes/seed-validation';
import { shamirToolRoute } from './routes/shamir-tool';
import { tinySeedRoute } from './routes/tiny-seed';
import { toolsIndexRoute, toolsRoute } from './routes/tools';
import { walletRecoveryRoute } from './routes/wallet-recovery';

// Create the route tree with tools layout and nested tool pages
const routeTree = rootRoute.addChildren([
  indexRoute,
  toolsRoute.addChildren([
    toolsIndexRoute,
    hashToolRoute,
    encryptionToolRoute,
    shamirToolRoute,
    passwordGeneratorRoute,
    qrCodeRoute,
    seedGenerationRoute,
    seedValidationRoute,
    walletRecoveryRoute,
    paperWalletRoute,
    tinySeedRoute,
  ]),
]);

// Create the router instance
// Use hash-based routing for file:// and content:// protocol compatibility
// Check at runtime if we're using file:// or content:// protocol
const getHistory = () => {
  if (typeof window !== 'undefined') {
    const protocol = window.location.protocol;
    if (protocol === 'file:' || protocol === 'content:') {
      return createHashHistory();
    }
  }
  return undefined; // Use default browser history
};

export const router = createRouter({
  routeTree,
  basepath: '',
  // Use hash-based routing when opening via file:// protocol
  history: getHistory(),
  defaultErrorComponent: RouteErrorFallback,
});

// Register the router instance for type safety
declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

// Export the RouterProvider component
export function NavigationProvider() {
  return <RouterProvider router={router} />;
}
