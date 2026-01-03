/**
 * i18n Configuration
 * Internationalization setup using i18next for React Native
 */

import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import * as Localization from 'expo-localization';

// Import consolidated locale data
import en from './locales/en.json';
import pl from './locales/pl.json';

export const defaultNS = 'common';
export const supportedLanguages = ['en', 'pl'] as const;
export type SupportedLanguage = (typeof supportedLanguages)[number];

export const resources = {
  en,
  pl,
} as const;

/**
 * Get device locale and map to supported language
 */
export function getDeviceLanguage(): SupportedLanguage {
  const deviceLocale = Localization.getLocales()[0]?.languageCode ?? 'en';
  return supportedLanguages.includes(deviceLocale as SupportedLanguage)
    ? (deviceLocale as SupportedLanguage)
    : 'en';
}

/**
 * Initialize i18n with default language
 * Note: The actual language will be synced from languageStore
 */
i18n.use(initReactI18next).init({
  compatibilityJSON: 'v4', // Required for React Native/Hermes (v4 for i18next v23+)
  resources,
  lng: 'en', // Default language, will be overridden by languageStore
  fallbackLng: 'en',
  ns: ['common', 'game', 'tutorial', 'errors'],
  defaultNS,
  interpolation: {
    escapeValue: false, // React already escapes values
  },
  react: {
    useSuspense: false, // Required for React Native
  },
});

/**
 * Change the current language
 */
export async function changeLanguage(language: SupportedLanguage): Promise<void> {
  await i18n.changeLanguage(language);
}

/**
 * Get current language
 */
export function getCurrentLanguage(): SupportedLanguage {
  return (i18n.language as SupportedLanguage) ?? 'en';
}

export default i18n;
