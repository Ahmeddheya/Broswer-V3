import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { getLocales } from 'expo-localization';
import { getItem, setItem } from './storage';

// Import translations
import en from '../locales/en.json';
import ar from '../locales/ar.json';

const resources = {
  en: { translation: en },
  ar: { translation: ar },
};

// Get device language
const deviceLanguage = getLocales()[0]?.languageCode || 'en';

// Get saved language preference
const savedLanguage = getItem<string>('language') || deviceLanguage;

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: savedLanguage,
    fallbackLng: 'en',
    
    interpolation: {
      escapeValue: false,
    },
    
    react: {
      useSuspense: false,
    },
  });

// Save language preference when changed
i18n.on('languageChanged', (lng) => {
  setItem('language', lng);
});

export default i18n;