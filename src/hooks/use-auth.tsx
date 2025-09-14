'use client';

import type { User } from '@/lib/types';
import { users } from '@/lib/data';
import React, { createContext, useContext, useState, ReactNode, useMemo, useCallback, useEffect } from 'react';

interface AuthContextType {
  user: User | null;
  login: (role: 'citizen' | 'admin') => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    try {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    } catch (error) {
      console.error("Could not parse user from localStorage", error);
      localStorage.removeItem('user');
    }
  }, []);
  

  const login = useCallback((role: 'citizen' | 'admin') => {
    const userToLogin = users.find((u) => u.role === role);
    if (userToLogin) {
      setUser(userToLogin);
      localStorage.setItem('user', JSON.stringify(userToLogin));
    }
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem('user');
    // We can't use router here, so AppWrapper will handle redirect
  }, []);

  const value = useMemo(() => ({ user, login, logout }), [user, login, logout]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
