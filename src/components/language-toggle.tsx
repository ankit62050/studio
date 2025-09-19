
'use client';

import { Button } from "@/components/ui/button";
import { useLanguage } from "@/hooks/use-language";

export function LanguageToggle() {
  const { language, toggleLanguage } = useLanguage();

  return (
    <Button variant="ghost" size="sm" onClick={toggleLanguage}>
      {language === 'en' ? 'हिंदी' : 'English'}
    </Button>
  );
}
