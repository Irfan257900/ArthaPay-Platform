import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import HttpApi from 'i18next-http-backend';
import LanguageDetector from 'i18next-browser-languagedetector';

i18n
  .use(HttpApi)
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    fallbackLng: 'en', // Default language
    debug: window.runtimeConfig.MODE === 'development',
    interpolation: {
      escapeValue: false, // React already escapes values
    },
    backend: {
      loadPath: '/locales/{{lng}}/translation.json', // Path to translation files
    },
  });

export default i18n;
