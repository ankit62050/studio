
'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAuth } from '@/hooks/use-auth';
import { LogOut, User as UserIcon, Shield } from 'lucide-react';
import Link from 'next/link';
import { LanguageToggle } from './language-toggle';
import { useLanguage } from '@/hooks/use-language';

const content = {
  en: {
    login: 'Login',
    signUp: 'Sign Up',
    profile: 'Profile',
    switchCitizen: 'Switch to Citizen',
    switchAdmin: 'Switch to Admin',
    logout: 'Log out'
  },
  hi: {
    login: 'लॉग इन करें',
    signUp: 'साइन अप करें',
    profile: 'प्रोफ़ाइल',
    switchCitizen: 'नागरिक पर स्विच करें',
    switchAdmin: 'एडमिन पर स्विच करें',
    logout: 'लॉग आउट'
  }
};

export function UserNav() {
  const { user, login, logout } = useAuth();
  const { language } = useLanguage();
  const navContent = content[language];

  if (!user) {
    return (
      <div className="flex items-center gap-2">
        <LanguageToggle />
        <Button onClick={() => login()}>{navContent.login}</Button>
        <Button variant="outline" onClick={() => login()}>{navContent.signUp}</Button>
      </div>
    );
  }

  return (
    <div className='flex items-center gap-2'>
      <LanguageToggle />
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="relative h-8 w-8 rounded-full">
            <Avatar className="h-9 w-9">
              <AvatarImage src={user.avatarUrl} alt={user.name} />
              <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56" align="end" forceMount>
          <DropdownMenuLabel className="font-normal">
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-medium leading-none">{user.name}</p>
              <p className="text-xs leading-none text-muted-foreground">
                {user.email}
              </p>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            <Link href="/profile" passHref>
              <DropdownMenuItem>
                <UserIcon className="mr-2 h-4 w-4" />
                <span>{navContent.profile}</span>
              </DropdownMenuItem>
            </Link>
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
           <DropdownMenuGroup>
              <DropdownMenuLabel className="text-xs font-semibold text-muted-foreground">Switch Role</DropdownMenuLabel>
               <DropdownMenuItem onSelect={() => login('citizen')} disabled={user.role === 'citizen'}>
                <UserIcon className="mr-2 h-4 w-4" />
                <span>{navContent.switchCitizen}</span>
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={() => login('admin')} disabled={user.role === 'admin'}>
                <Shield className="mr-2 h-4 w-4" />
                <span>{navContent.switchAdmin}</span>
              </DropdownMenuItem>
            </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuItem onSelect={logout}>
            <LogOut className="mr-2 h-4 w-4" />
            <span>{navContent.logout}</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
