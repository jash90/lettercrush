/**
 * Language Store
 * Manages game language selection with persistence
 * Uses platform-specific storage (localStorage for web, SecureStore for native)
 * Dictionary loading is handled by _layout.tsx when language state changes
 * i18n is synchronized automatically on language changes
 */

import { create } from 'zustand';
import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import type { Language } from '../types/game.types';
import { logger } from '../utils/logger';
import { changeLanguage as changeI18nLanguage } from '../i18n';
// Note: Dictionary loading is handled by _layout.tsx when language changes
// to avoid race conditions and provide proper loading UI

const LANGUAGE_STORAGE_KEY = 'lettercrush_language';
const FIRST_RUN_KEY = 'lettercrush_first_run_complete';

// Platform-specific storage abstraction
const storage = {
  async getItem(key: string): Promise<string | null> {
    if (Platform.OS === 'web') {
      return typeof localStorage !== 'undefined' ? localStorage.getItem(key) : null;
    }
    try {
      return await SecureStore.getItemAsync(key);
    } catch {
      return null;
    }
  },
  async setItem(key: string, value: string): Promise<void> {
    if (Platform.OS === 'web') {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(key, value);
      }
      return;
    }
    try {
      await SecureStore.setItemAsync(key, value);
    } catch (error) {
      logger.warn('[Storage] Failed to save:', error);
    }
  },
};

interface LanguageStore {
  language: Language;
  isLoaded: boolean;
  isFirstRun: boolean;
  setLanguage: (language: Language) => Promise<void>;
  loadLanguage: () => Promise<void>;
  completeFirstRun: () => Promise<void>;
}

export const useLanguageStore = create<LanguageStore>((set, get) => ({
  language: 'en',
  isLoaded: false,
  isFirstRun: true,

  setLanguage: async (language: Language) => {
    try {
      await storage.setItem(LANGUAGE_STORAGE_KEY, language);
      set({ language });
      // Sync i18n language
      await changeI18nLanguage(language);
      // Dictionary loading is triggered by _layout.tsx when language state changes
    } catch (error) {
      logger.error('[LanguageStore] Failed to save language:', error);
      // Still update state even if persistence fails
      set({ language });
      // Try to sync i18n even if storage fails
      await changeI18nLanguage(language).catch(() => {});
    }
  },

  loadLanguage: async () => {
    try {
      // Load language preference
      const stored = await storage.getItem(LANGUAGE_STORAGE_KEY);
      const language = (stored === 'en' || stored === 'pl') ? stored : 'en';

      // Check first-run status
      const firstRunComplete = await storage.getItem(FIRST_RUN_KEY);
      const isFirstRun = firstRunComplete !== 'complete';

      // Sync i18n language with stored preference
      await changeI18nLanguage(language);

      set({ language, isLoaded: true, isFirstRun });
    } catch (error) {
      logger.error('[LanguageStore] Failed to load language:', error);
      set({ isLoaded: true, isFirstRun: true });
    }
  },

  completeFirstRun: async () => {
    try {
      await storage.setItem(FIRST_RUN_KEY, 'complete');
      set({ isFirstRun: false });
    } catch (error) {
      logger.error('[LanguageStore] Failed to save first run state:', error);
      // Still update state even if persistence fails
      set({ isFirstRun: false });
    }
  },
}));
