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
import { LogOut, User as UserIcon, Shield, UserCheck } from 'lucide-react';
import Link from 'next/link';

export function UserNav() {
  const { user, login, logout } = useAuth();

  if (!user) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="relative h-8 w-8 rounded-full">
            <Avatar className="h-9 w-9">
              <AvatarFallback>
                <UserIcon/>
              </AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56" align="end" forceMount>
          <DropdownMenuLabel className="font-normal">
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-medium leading-none">Guest</p>
              <p className="text-xs leading-none text-muted-foreground">
                Not logged in
              </p>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
             <DropdownMenuItem onSelect={() => login('citizen')}>
              <UserIcon className="mr-2 h-4 w-4" />
              <span>Log in as Citizen</span>
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={() => login('admin')}>
              <Shield className="mr-2 h-4 w-4" />
              <span>Log in as Admin</span>
            </DropdownMenuItem>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  return (
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
              <span>Profile</span>
            </DropdownMenuItem>
          </Link>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
         <DropdownMenuGroup>
            <DropdownMenuLabel className="text-xs font-semibold text-muted-foreground">Switch User</DropdownMenuLabel>
             <DropdownMenuItem onSelect={() => login('citizen')} disabled={user.role === 'citizen'}>
              <UserIcon className="mr-2 h-4 w-4" />
              <span>Switch to Citizen</span>
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={() => login('admin')} disabled={user.role === 'admin'}>
              <Shield className="mr-2 h-4 w-4" />
              <span>Switch to Admin</span>
            </DropdownMenuItem>
          </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem onSelect={logout}>
          <LogOut className="mr-2 h-4 w-4" />
          <span>Log out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
