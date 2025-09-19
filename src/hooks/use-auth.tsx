
'use client';

import type { User as AppUser } from '@/lib/types';
import React, { createContext, useContext, useState, ReactNode, useMemo, useCallback, useEffect } from 'react';
import { auth, googleProvider } from '@/lib/firebase';
import { signInWithPopup, onAuthStateChanged, signOut, User as FirebaseUser } from 'firebase/auth';
import { users as mockUsers } from '@/lib/data';

interface AuthContextType {
  user: AppUser | null;
  firebaseUser: FirebaseUser | null;
  loading: boolean;
  login: (role: 'citizen' | 'admin') => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AppUser | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [targetRole, setTargetRole] = useState<'citizen' | 'admin' | null>(null);

  const handleLogin = async (role: 'citizen' | 'admin') => {
    setLoading(true);
    setTargetRole(role);
    try {
      await signInWithPopup(auth, googleProvider);
      // onAuthStateChanged will handle the rest
    } catch (error) {
      console.error("Google sign-in error", error);
      setLoading(false);
    }
  };

  const handleLogout = useCallback(async () => {
    setLoading(true);
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Sign out error", error);
    } finally {
      setUser(null);
      setFirebaseUser(null);
      localStorage.removeItem('user');
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentFirebaseUser) => {
      if (currentFirebaseUser) {
        setFirebaseUser(currentFirebaseUser);
        let appUser = mockUsers.find(u => u.email === currentFirebaseUser.email);
        
        // If user not in mock, create one based on role or default to citizen
        if (!appUser) {
           appUser = {
            id: currentFirebaseUser.uid,
            name: currentFirebaseUser.displayName || 'New User',
            email: currentFirebaseUser.email!,
            role: targetRole || 'citizen',
            avatarUrl: currentFirebaseUser.photoURL || undefined,
          };
        } else {
            // If user exists, just update role if a specific one was targeted
            if(targetRole) {
                appUser.role = targetRole;
            }
        }
        
        setUser(appUser);
        localStorage.setItem('user', JSON.stringify(appUser));
      } else {
        setUser(null);
        setFirebaseUser(null);
        localStorage.removeItem('user');
      }
      setLoading(false);
      setTargetRole(null);
    });

    return () => unsubscribe();
  }, [targetRole]);
  
  useEffect(() => {
      // Hydrate user from local storage on initial load
      try {
          const storedUser = localStorage.getItem('user');
          if(storedUser) {
              setUser(JSON.parse(storedUser));
          }
      } catch (e) {
          console.error("Failed to parse user from local storage", e);
          localStorage.removeItem('user');
      }
      setLoading(false);
  },[])

  const value = useMemo(() => ({ user, firebaseUser, loading, login: handleLogin, logout: handleLogout }), [user, firebaseUser, loading, handleLogout]);

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
