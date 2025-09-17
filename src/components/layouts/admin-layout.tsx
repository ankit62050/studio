
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarInset,
  SidebarTrigger
} from '@/components/ui/sidebar';
import { Logo } from '@/components/logo';
import { UserNav } from '@/components/user-nav';
import { Shield, MapIcon, Mail, HelpCircle } from 'lucide-react';
import { Chatbot } from '../chatbot';

interface AdminLayoutProps {
  children: React.ReactNode;
}

export function AdminLayout({ children }: AdminLayoutProps) {
  const pathname = usePathname();
  const routes = [
    { href: '/admin', label: 'Dashboard', icon: Shield },
    { href: '/admin/map', label: 'Map View', icon: MapIcon },
    { href: '/faq', label: 'FAQ', icon: HelpCircle },
    { href: '/contact', label: 'Contact', icon: Mail },
  ];

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader>
          <Logo />
        </SidebarHeader>
        <SidebarContent>
          <SidebarMenu>
            {routes.map((route) => (
              <SidebarMenuItem key={route.href}>
                <Link href={route.href}>
                  <SidebarMenuButton
                    isActive={pathname === route.href}
                    tooltip={route.label}
                  >
                    <route.icon className="text-info" />
                    <span>{route.label}</span>
                  </SidebarMenuButton>
                </Link>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarContent>
      </Sidebar>
      <SidebarInset>
        <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="relative">
                <div className="absolute top-0 left-0 w-full h-1 flex">
                    <div className="flex-1 bg-primary"></div>
                    <div className="flex-1 bg-white"></div>
                    <div className="flex-1 bg-accent"></div>
                </div>
            </div>
          <div className="container flex h-14 items-center pt-1">
             <div className="md:hidden mr-2">
                <SidebarTrigger />
            </div>
            <div className="flex-1">
              <Logo/>
            </div>
            <UserNav />
          </div>
        </header>
        <div className="flex-1 p-4 md:p-8">
            <div className="hidden md:flex justify-end mb-4">
                <UserNav />
            </div>
            {children}
        </div>
        <Chatbot />
      </SidebarInset>
    </SidebarProvider>
  );
}
