'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/use-auth';
import { Logo } from './logo';

export function MainNav({
  className,
  ...props
}: React.HTMLAttributes<HTMLElement>) {
  const pathname = usePathname();
  const { user } = useAuth();

  const citizenRoutes = [
    { href: '/', label: 'Dashboard' },
    { href: '/community', label: 'Community' },
    { href: '/history', label: 'My History' },
    { href: '/faq', label: 'FAQ' },
    { href: '/contact', label: 'Contact Us' },
  ];
  
  const adminRoutes = [
    { href: '/admin', label: 'Admin Dashboard' },
    { href: '/community', label: 'Community' },
  ]

  const routes = user?.role === 'admin' ? adminRoutes : citizenRoutes;

  if (!user) return null;

  return (
    <nav
      className={cn('hidden md:flex items-center gap-6 text-sm', className)}
      {...props}
    >
      {routes.map((route) => (
        <Link
          key={route.href}
          href={route.href}
          className={cn(
            'transition-colors hover:text-primary',
            pathname === route.href
              ? 'text-foreground font-semibold'
              : 'text-muted-foreground'
          )}
        >
          {route.label}
        </Link>
      ))}
    </nav>
  );
}
