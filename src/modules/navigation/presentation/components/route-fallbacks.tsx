import {
  type ErrorComponentProps,
  Link,
  useRouter,
} from '@tanstack/react-router';

import { Button } from '$/components/ui/button';
import { ErrorPanel } from '$/components/ui/error-panel';

import { Navbar } from './navbar';
import { SiteFooter } from './site-footer';

/**
 * Render failure inside a route segment. Rendered within the nearest layout,
 * so the tools shell (sidebar, navbar) survives a broken page.
 */
export function RouteErrorFallback({ error, reset }: ErrorComponentProps) {
  const router = useRouter();

  return (
    <ErrorPanel
      code="Error"
      title="This page failed to load."
      description="Nothing was sent anywhere. Try again, or go back to the list of tools."
      detail={import.meta.env.DEV ? String(error?.stack ?? error) : undefined}
      actions={
        <>
          <Button
            onClick={() => {
              reset();
              void router.invalidate();
            }}
          >
            Try again
          </Button>
          <Button asChild variant="outline">
            <Link to="/tools">All tools</Link>
          </Button>
        </>
      }
    />
  );
}

/** Unknown route under /tools, rendered inside the tools shell. */
export function ToolNotFound() {
  return (
    <>
      <title>Page not found | Offline Tools</title>
      <meta name="robots" content="noindex" />
      <ErrorPanel
        code="404"
        title="This tool does not exist."
        description="It may have been removed or renamed. The full list is one click away."
        actions={
          <Button asChild>
            <Link to="/tools">All tools</Link>
          </Button>
        }
      />
    </>
  );
}

/** Unknown route outside /tools: no shell around it, so bring the chrome. */
export function PageNotFound() {
  return (
    <>
      <title>Page not found | Offline Tools</title>
      <meta name="robots" content="noindex" />
      <Navbar />
      <main id="main">
        <ErrorPanel
          code="404"
          title="Page not found."
          description="The address does not match any page of Offline Tools."
          actions={
            <>
              <Button asChild>
                <Link to="/tools">All tools</Link>
              </Button>
              <Button asChild variant="outline">
                <Link to="/">Home</Link>
              </Button>
            </>
          }
        />
      </main>
      <SiteFooter />
    </>
  );
}
