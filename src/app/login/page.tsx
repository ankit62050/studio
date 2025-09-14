'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/hooks/use-auth';
import { Shield, User } from 'lucide-react';
import { Logo } from '@/components/logo';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const { login, user } = useAuth();
  const router = useRouter();

  const handleLogin = (role: 'citizen' | 'admin') => {
    login(role);
    router.push(role === 'admin' ? '/admin' : '/');
  };

  // If user is already logged in, redirect them.
  if (user) {
    if (typeof window !== 'undefined') {
      router.push(user.role === 'admin' ? '/admin' : '/');
    }
    return null; // or a loading spinner
  }

  return (
    <div className="relative flex min-h-screen flex-col">
       <div className="absolute inset-0 -z-10">
        <Image
          src="https://picsum.photos/seed/loginhero/1200/800"
          alt="A vibrant city street with blurred motion."
          fill
          style={{ objectFit: 'cover' }}
          data-ai-hint="city street"
        />
        <div className="absolute inset-0 bg-background/60 backdrop-blur-sm" />
      </div>
      <div className="container relative grid flex-1 items-center justify-center lg:grid-cols-2">
        <div className="hidden flex-col text-white lg:flex">
          <div className='flex items-center gap-4'>
            <Logo className="text-4xl text-white" />
          </div>
          <h1 className="mt-4 text-5xl font-bold tracking-tighter">
            Report issues. See results.
          </h1>
          <p className="mt-4 text-lg text-white/80">
            JANConnect Lite is the easiest way for citizens to report non-emergency issues to the city and see them get resolved.
          </p>
        </div>
        <Card className="mx-auto w-full max-w-sm">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Welcome Back</CardTitle>
            <CardDescription>
              Please select your role to log in.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button className="w-full" size="lg" onClick={() => handleLogin('citizen')}>
              <User className="mr-2" />
              Log in as Citizen
            </Button>
            <Button className="w-full" size="lg" variant="secondary" onClick={() => handleLogin('admin')}>
              <Shield className="mr-2" />
              Log in as Admin
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
