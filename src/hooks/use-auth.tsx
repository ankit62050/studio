
'use client';

import type { User as AppUser } from '@/lib/types';
import React, { createContext, useContext, useState, ReactNode, useMemo, useCallback } from 'react';
import { users as mockUsers } from '@/lib/data';

interface AuthContextType {
  user: AppUser | null;
  loading: boolean;
  login: (role?: 'citizen' | 'admin') => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Default to the first citizen user for a logged-out experience
const defaultUser = mockUsers.find(u => u.role === 'citizen')!;

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AppUser | null>(defaultUser);
  const [loading, setLoading] = useState(false);

  const login = useCallback((role: 'citizen' | 'admin' = 'citizen') => {
    const userToLogin = mockUsers.find(u => u.role === role);
    setUser(userToLogin || defaultUser);
  }, []);

  const logout = useCallback(() => {
    setUser(defaultUser);
  }, []);

  const value = useMemo(() => ({
    user,
    loading,
    login,
    logout,
  }), [user, loading, login, logout]);

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
