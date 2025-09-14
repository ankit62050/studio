'use client';

import type { User } from '@/lib/types';
import { users } from '@/lib/data';
import React, { createContext, useContext, useState, ReactNode, useMemo, useCallback } from 'react';

interface AuthContextType {
  user: User | null;
  login: (role: 'citizen' | 'admin') => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  const login = useCallback((role: 'citizen' | 'admin') => {
    const userToLogin = users.find((u) => u.role === role);
    setUser(userToLogin || null);
  }, []);

  const logout = useCallback(() => {
    setUser(null);
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
