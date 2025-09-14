'use client';

import { usePathname } from 'next/navigation';
import React, { useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { AppLayout } from '@/components/layouts/app-layout';
import { AdminLayout } from '@/components/layouts/admin-layout';
import LoginPage from '@/components/login-page';
import SignupPage from '@/components/signup-page';
import { Skeleton } from './ui/skeleton';

export function AppWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user } = useAuth();
  const [isMounted, setIsMounted] = React.useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
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
    return <LoginPage />;
  }

  if (pathname === '/signup') {
    return <SignupPage />;
  }

  if (!user) {
    return <LoginPage />;
  }

  if (pathname.startsWith('/admin')) {
    if (user.role === 'admin') {
      return <AdminLayout>{children}</AdminLayout>;
    }
    // Simple access denied for now. In a real app, you'd redirect.
    return (
      <AppLayout>
        <div className="text-center">
          <h1 className="text-2xl font-bold">Access Denied</h1>
          <p>You do not have permission to view this page.</p>
        </div>
      </AppLayout>
    );
  }

  // Citizen user on a citizen page
  if (user.role === 'citizen') {
    return <AppLayout>{children}</AppLayout>;
  }
  
  // Admin user on a citizen page
  if (user.role === 'admin' && !pathname.startsWith('/admin')) {
     return <AdminLayout>{children}</AdminLayout>;
  }


  return <div>Loading...</div>;
}
