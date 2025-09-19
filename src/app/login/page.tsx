'use client';

import { useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { Shield, User } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { HeroSection } from '@/components/ui/hero-section';
import { Icons } from '@/components/ui/icons';

export default function LoginPage() {
  const { login, user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (user) {
      router.push(user.role === 'admin' ? '/admin' : '/');
    }
  }, [user, router]);
  
  // If user is logged in, we show nothing and let the effect redirect.
  if (user) {
    return null; 
  }

  return (
    <div className="relative flex min-h-screen flex-col">
      <HeroSection
          badge={{
            text: "Welcome to JANConnect Lite",
            action: {
              text: "Learn more",
              href: "/faq",
            },
          }}
          title="Report issues. See results."
          description="JANConnect Lite is the easiest way for citizens to report non-emergency issues to the city and see them get resolved. Select your role to get started."
          actions={[
            {
              text: "Log in as Citizen",
              href: "#",
              variant: "default",
              icon: <User className="h-5 w-5" onClick={() => login('citizen')}/>,
            },
            {
              text: "Log in as Admin",
              href: "#",
              variant: "glow",
              icon: <Shield className="h-5 w-5" onClick={() => login('admin')} />,
            },
          ]}
          image={{
            light: "https://picsum.photos/seed/app-light/1248/765",
            dark: "https://picsum.photos/seed/app-dark/1248/765",
            alt: "App Preview",
          }}
        />
    </div>
  );
}
