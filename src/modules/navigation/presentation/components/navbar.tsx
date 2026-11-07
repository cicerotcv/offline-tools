import { useState } from 'react';

import { Link, useLocation } from '@tanstack/react-router';
import { Menu, X } from 'lucide-react';

import { ThemeToggle } from '@/shared/presentation/components/theme-toggle';
import { SvgLogo } from '@/shared/presentation/svg/logo';

import { Button } from '$/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '$/components/ui/dropdown-menu';
import { cn } from '$/lib/utils';

import { navLinks, REPO_URL } from '../../lib/site';

function isActivePath(pathname: string, to: string) {
  return to === '/' ? pathname === '/' : pathname.startsWith(to);
}

export function Navbar({ className }: { className?: string }) {
  const { pathname } = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header
      className={cn(
        'sticky top-0 z-40 border-b bg-background/85 backdrop-blur-md',
        className
      )}
    >
      <div
        className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4
          sm:px-6 lg:px-8"
      >
        <Link
          to="/"
          aria-label="Offline Tools home"
          className="rounded-sm text-foreground"
        >
          <SvgLogo className="h-6" />
        </Link>

        <nav aria-label="Main" className="hidden items-center gap-1 md:flex">
          {navLinks.map((link) => {
            const active = isActivePath(pathname, link.to);
            return (
              <Link
                key={link.to}
                to={link.to}
                aria-current={active ? 'page' : undefined}
                className={cn(
                  `relative rounded-md px-3 py-1.5 text-sm font-medium
                  transition-colors hover:bg-accent hover:text-foreground`,
                  active
                    ? `text-foreground after:absolute after:inset-x-3
                      after:-bottom-[12px] after:h-px after:bg-primary`
                    : 'text-muted-foreground'
                )}
              >
                {link.label}
              </Link>
            );
          })}
          <a
            href={REPO_URL}
            target="_blank"
            rel="noreferrer"
            className="rounded-md px-3 py-1.5 text-sm font-medium
              text-muted-foreground transition-colors hover:bg-accent
              hover:text-foreground"
          >
            Source
          </a>
          <span aria-hidden className="mx-2 h-5 w-px bg-border" />
          <ThemeToggle />
        </nav>

        <div className="flex items-center gap-1 md:hidden">
          <ThemeToggle />
          <DropdownMenu open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" aria-label="Open menu">
                {mobileMenuOpen ? (
                  <X className="h-5 w-5" />
                ) : (
                  <Menu className="h-5 w-5" />
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              {navLinks.map((link) => (
                <DropdownMenuItem key={link.to} asChild>
                  <Link
                    to={link.to}
                    aria-current={
                      isActivePath(pathname, link.to) ? 'page' : undefined
                    }
                    className="w-full aria-[current=page]:font-medium"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {link.label}
                  </Link>
                </DropdownMenuItem>
              ))}
              <DropdownMenuItem asChild>
                <a href={REPO_URL} target="_blank" rel="noreferrer">
                  Source
                </a>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
