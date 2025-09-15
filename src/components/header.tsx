import { MainNav } from '@/components/main-nav';
import { UserNav } from '@/components/user-nav';

export function Header() {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-info/20 bg-info text-info-foreground">
      <div className="relative">
        <div className="absolute top-0 left-0 w-full h-1 flex">
          <div className="flex-1 bg-primary"></div>
          <div className="flex-1 bg-white"></div>
          <div className="flex-1 bg-accent"></div>
        </div>
      </div>
      <div className="container flex h-16 items-center space-x-4 sm:justify-between sm:space-x-0 pt-1">
        <MainNav />
        <div className="flex flex-1 items-center justify-end space-x-4">
          <UserNav />
        </div>
      </div>
    </header>
  );
}
