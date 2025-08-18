import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from './locales/en/common.json';
import zh from './locales/zh/common.json';
import jp from './locales/jp/common.json';

// Language resources
const resources = {
  en: {
    translation: en,
  },
  zh: {
    translation: zh,
  },
  jp: {
    translation: jp,
  },
};

// Initialize i18next
i18n.use(initReactI18next).init({
  resources,
  lng: 'zh-TW', // Default language
  fallbackLng: 'zh-TW', // Fallback language if not found
  interpolation: {
    escapeValue: false, // React already escapes values
  },
});

export default i18n;