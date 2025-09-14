'use client';

import { usePathname, useRouter } from 'next/navigation';
import React, { useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { AppLayout } from '@/components/layouts/app-layout';
import { AdminLayout } from '@/components/layouts/admin-layout';
import { Skeleton } from './ui/skeleton';

export function AppWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user } = useAuth();
  const [isMounted, setIsMounted] = React.useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (isMounted && !user && pathname !== '/login') {
      router.push('/login');
    }
  }, [isMounted, user, pathname, router]);

  if (!isMounted || (!user && pathname !== '/login')) {
    return (
      <div className="w-full h-screen p-8">
        <div className="flex items-center space-x-4 mb-8">
          <Skeleton className="h-12 w-12 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-[250px]" />
            <Skeleton className="h-4 w-[200px]" />
          </div>
        </div>
        <Skeleton className="h-[400px] w-full" />
      </div>
    );
  }
  
  if (pathname === '/login') {
    return <>{children}</>;
  }

  // This should not happen if the effect above works correctly, but as a safeguard.
  if (!user) {
    return null;
  }

  const isAdminPath = pathname.startsWith('/admin');
  
  if (isAdminPath) {
    if (user.role === 'admin') {
      return <AdminLayout>{children}</AdminLayout>;
    } else {
      // If a citizen tries to access an admin path, show access denied within their layout.
      return (
        <AppLayout>
          <div className="text-center">
            <h1 className="text-2xl font-bold">Access Denied</h1>
            <p>You do not have permission to view this page.</p>
          </div>
        </AppLayout>
      );
    }
  }

  // For non-admin paths
  if (user.role === 'citizen') {
    return <AppLayout>{children}</AppLayout>;
  }

  if (user.role === 'admin') {
     // Admin visiting a citizen page, we can redirect or show the app layout.
     // Redirecting to admin dashboard is a sensible default.
      if (typeof window !== 'undefined') {
        router.push('/admin');
      }
      return null;
  }

  // Fallback, should not be reached.
  return null;
}
