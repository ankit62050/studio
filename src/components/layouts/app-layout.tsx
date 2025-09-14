import { Header } from "@/components/header";
import { MobileNav } from "@/components/mobile-nav";

interface AppLayoutProps {
  children: React.ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  return (
    <div className="relative flex min-h-screen flex-col">
      <Header />
      <main className="flex-1 container py-8 pb-24">{children}</main>
      <MobileNav />
    </div>
  );
}
