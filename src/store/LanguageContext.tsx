import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import i18n, { setLocale } from '../i18n';
import { Language } from '../types';

const LANGUAGE_KEY = 'app_language';
const SUPPORTED_LANGUAGES: Language[] = ['en', 'es', 'fr', 'hi', 'zh'];

interface LanguageContextValue {
  language: Language;
  setLanguage: (next: Language) => Promise<void>;
}

const LanguageContext = createContext<LanguageContextValue>({
  language: 'en',
  setLanguage: async () => {},
});

function isLanguage(value: string | null): value is Language {
  return !!value && SUPPORTED_LANGUAGES.includes(value as Language);
}

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>(i18n.locale as Language);

  useEffect(() => {
    AsyncStorage.getItem(LANGUAGE_KEY).then((stored) => {
      if (isLanguage(stored)) {
        setLocale(stored);
        setLanguageState(stored);
      }
    });
  }, []);

  const setLanguage = async (next: Language) => {
    setLanguageState(next);
    setLocale(next);
    await AsyncStorage.setItem(LANGUAGE_KEY, next);
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
}

export const useLanguage = () => useContext(LanguageContext);