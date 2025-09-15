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
      <Logo />
      {routes.map((route) => (
        <Link
          key={route.href}
          href={route.href}
          className={cn(
            'relative font-medium text-white/80 transition-colors hover:text-white',
            pathname === route.href && 'text-white',
            'after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-full after:origin-bottom-right after:scale-x-0 after:bg-primary after:transition-transform after:duration-300 after:ease-out hover:after:origin-bottom-left hover:after:scale-x-100',
            pathname === route.href && 'after:origin-bottom-left after:scale-x-100'
          )}
        >
          {route.label}
        </Link>
      ))}
    </nav>
  );
}
