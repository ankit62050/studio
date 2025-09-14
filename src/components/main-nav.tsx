'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/use-auth';
import { Logo } from '@/components/logo';

export function MainNav({
  className,
  ...props
}: React.HTMLAttributes<HTMLElement>) {
  const pathname = usePathname();
  const { user } = useAuth();

  const citizenRoutes = [
    { href: '/', label: 'Dashboard' },
    { href: '/community', label: 'Community' },
    { href: '/map', label: 'Map' },
    { href: '/submit', label: 'New Complaint' },
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
      <Link href={user.role === 'admin' ? '/admin' : '/'} className="mr-4">
        <Logo />
      </Link>
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
