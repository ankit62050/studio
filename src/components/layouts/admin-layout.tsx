
'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import {
  Sidebar,
  SidebarBody,
  SidebarLink,
} from '@/components/ui/sidebar';
import { Logo } from '@/components/logo';
import { useAuth } from '@/hooks/use-auth';
import { Shield, MapIcon, Mail, HelpCircle } from 'lucide-react';
import { Chatbot } from '../chatbot';
import { cn } from '@/lib/utils';
import { UserNav } from '../user-nav';
import { useLanguage } from '@/hooks/use-language';

const content = {
  en: {
    dashboard: 'Dashboard',
    mapView: 'Map View',
    faq: 'FAQ',
    contact: 'Contact',
  },
  hi: {
    dashboard: 'डैशबोर्ड',
    mapView: 'मानचित्र दृश्य',
    faq: 'सामान्य प्रश्न',
    contact: 'संपर्क',
  },
};

const LogoIcon = () => {
    return (
      <Link
        href="/admin"
        className="font-normal flex space-x-2 items-center text-sm text-black py-1 relative z-20"
      >
        <div className="h-5 w-6 bg-black dark:bg-white rounded-br-lg rounded-tr-sm rounded-tl-lg rounded-bl-sm flex-shrink-0" />
      </Link>
    );
  };

export function AdminLayout({ children }: { children: React.ReactNode}) {
  const pathname = usePathname();
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const { language } = useLanguage();
  const pageContent = content[language];

  const links = [
    { href: '/admin', label: pageContent.dashboard, icon: <Shield className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" /> },
    { href: '/admin/map', label: pageContent.mapView, icon: <MapIcon className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" /> },
    { href: '/faq', label: pageContent.faq, icon: <HelpCircle className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" /> },
    { href: '/contact', label: pageContent.contact, icon: <Mail className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" /> },
  ];

  return (
    <div
      className={cn(
        "rounded-md flex flex-col md:flex-row bg-gray-100 dark:bg-neutral-800 w-full flex-1 h-screen mx-auto border border-neutral-200 dark:border-neutral-700"
      )}
    >
      <Sidebar open={open} setOpen={setOpen}>
        <SidebarBody className="justify-between gap-10">
          <div className="flex flex-col flex-1 overflow-y-auto overflow-x-hidden">
            {open ? <div className='p-2'><Logo /></div> : <LogoIcon />}
            <div className="mt-8 flex flex-col gap-2">
              {links.map((link, idx) => (
                <SidebarLink key={idx} link={link} className={cn(pathname === link.href && "bg-neutral-200 dark:bg-neutral-700")}/>
              ))}
            </div>
          </div>
          {user && (
            <div>
              <SidebarLink
                link={{
                  label: user.name,
                  href: "/profile",
                  icon: (
                    <Image
                      src={user.avatarUrl || "https://picsum.photos/seed/avatar/50/50"}
                      className="h-7 w-7 flex-shrink-0 rounded-full"
                      width={50}
                      height={50}
                      alt="Avatar"
                    />
                  ),
                }}
              />
            </div>
          )}
        </SidebarBody>
      </Sidebar>
      <main className="flex-1 flex flex-col h-screen">
        <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="relative">
                <div className="absolute top-0 left-0 w-full h-1 flex">
                    <div className="flex-1 bg-primary"></div>
                    <div className="flex-1 bg-white"></div>
                    <div className="flex-1 bg-accent"></div>
                </div>
            </div>
          <div className="container flex h-14 items-center pt-1 md:hidden">
            <div className="flex-1">
              <Logo/>
            </div>
            <UserNav />
          </div>
        </header>
        <div className="flex-1 p-4 md:p-8 overflow-y-auto">
            <div className="hidden md:flex justify-end mb-4">
                <UserNav />
            </div>
            {children}
        </div>
        <Chatbot />
      </main>
    </div>
  );
}

    