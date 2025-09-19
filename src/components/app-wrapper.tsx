
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
  const { user, loading } = useAuth();
  const [isMounted, setIsMounted] = React.useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (isMounted && !loading && user?.role === 'admin' && !pathname.startsWith('/admin')) {
      router.push('/admin');
    }
  }, [isMounted, user, loading, pathname, router]);
  
  // A simple loading skeleton
  if (!isMounted || loading) {
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
  
  if (!user) {
    // For logged-out users, show the content of the page (e.g., landing page)
    // inside the basic AppLayout (which provides header/footer).
    return <AppLayout>{children}</AppLayout>
  }
  
  const isAdminPath = pathname.startsWith('/admin');
  
  if (isAdminPath) {
    if (user.role === 'admin') {
      return <AdminLayout>{children}</AdminLayout>;
    } else {
      // Redirect citizen to their dashboard if they try to access admin pages.
      router.push('/');
      return null;
    }
  }

  // For non-admin paths, show citizen layout
  if (user.role === 'citizen') {
    return <AppLayout>{children}</AppLayout>;
  }
  
  // If an admin is on a non-admin page, the useEffect above will redirect them.
  // We return a loading state to prevent rendering the citizen UI briefly.
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
