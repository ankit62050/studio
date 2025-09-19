
'use client';

import React, { createContext, useContext, useState, ReactNode, useMemo, useCallback, useEffect } from 'react';

type Language = 'en' | 'hi';

interface LanguageContextType {
  language: Language;
  setLanguage: (language: Language) => void;
  toggleLanguage: () => void;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>('en');

  useEffect(() => {
    const storedLang = localStorage.getItem('language') as Language | null;
    if (storedLang && ['en', 'hi'].includes(storedLang)) {
      setLanguage(storedLang);
    }
  }, []);

  const handleSetLanguage = useCallback((lang: Language) => {
    setLanguage(lang);
    localStorage.setItem('language', lang);
  }, []);

  const toggleLanguage = useCallback(() => {
    const newLang = language === 'en' ? 'hi' : 'en';
    handleSetLanguage(newLang);
  }, [language, handleSetLanguage]);

  const value = useMemo(() => ({ language, setLanguage: handleSetLanguage, toggleLanguage }), [language, handleSetLanguage, toggleLanguage]);

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
