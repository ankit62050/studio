'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Home, PlusCircle, History, User, Shield, Users, Map } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';

export function MobileNav() {
  const pathname = usePathname();
  const { user } = useAuth();
  
  const citizenRoutes = [
    { href: '/', label: 'Home', icon: Home },
    { href: '/community', label: 'Community', icon: Users },
    { href: '/submit', label: 'Submit', icon: PlusCircle },
    { href: '/history', label: 'History', icon: History },
    { href: '/profile', label: 'Profile', icon: User },
  ];

  const adminRoutes = [
    { href: '/admin', label: 'Dashboard', icon: Shield },
    { href: '/admin/map', label: 'Map', icon: Map },
    { href: '/community', label: 'Community', icon: Users },
    { href: '/profile', label: 'Profile', icon: User },
  ];

  const routes = user?.role === 'admin' ? adminRoutes : citizenRoutes;
  
  if (!user) return null;

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <nav className={`grid h-16 items-center text-xs grid-cols-${routes.length}`}>
        {routes.map((route) => {
          const isActive = pathname === route.href;
          return (
            <Link
              key={route.href}
              href={route.href}
              className={cn(
                'flex flex-col items-center justify-center gap-1 transition-colors',
                isActive ? 'text-primary font-semibold' : 'text-muted-foreground hover:text-primary'
              )}
            >
              <route.icon className="h-5 w-5" />
              <span>{route.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
