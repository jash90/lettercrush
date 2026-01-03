/**
 * useDictionary Hook
 * Encapsulates dictionary initialization and management
 * Handles loading, validation, and database seeding
 */

import { useState, useCallback, useRef, useEffect } from 'react';
import { getWordValidator } from '../engine/WordValidator';
import { isDictionarySeeded, loadDictionary, getWordCount, clearDictionary } from '../db';
import { getDictionary } from '../data/dictionaries';
import type { Language } from '../types/game.types';
import { logger } from '../utils/logger';

interface UseDictionaryOptions {
  /** Language to load dictionary for */
  language: Language;
  /** Whether to auto-load on mount */
  autoLoad?: boolean;
}

interface UseDictionaryReturn {
  /** Whether the dictionary is loaded and ready */
  isLoaded: boolean;
  /** Loading state */
  isLoading: boolean;
  /** Error that occurred during loading */
  error: Error | null;
  /** Number of words in the dictionary */
  wordCount: number;
  /** Reload dictionary for a specific language */
  reloadDictionary: (language: Language) => Promise<void>;
}

export function useDictionary(options: UseDictionaryOptions): UseDictionaryReturn {
  const { language, autoLoad = true } = options;

  const [isLoaded, setIsLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [wordCount, setWordCount] = useState(0);

  const currentLanguageRef = useRef<Language | null>(null);
  const isInitializedRef = useRef(false);

  /**
   * Initialize dictionary for a given language
   * Loads into WordValidator and seeds database if needed
   */
  const initializeDictionary = useCallback(async (lang: Language): Promise<void> => {
    setIsLoading(true);
    setError(null);

    try {
      const dictionary = getDictionary(lang);
      const validator = getWordValidator();

      // Load dictionary into validator (in-memory)
      validator.loadDictionary(dictionary);
      setWordCount(dictionary.length);

      // Seed database for native platforms
      try {
        const seeded = await isDictionarySeeded();
        const dbWordCount = getWordCount();
        const expectedCount = dictionary.length;

        // Reload if not seeded OR if word count doesn't match (dictionary was updated)
        if (!seeded || dbWordCount !== expectedCount) {
          console.log(`[useDictionary] Dictionary reload: DB has ${dbWordCount}, expected ${expectedCount}`);
          await clearDictionary();
          await loadDictionary(dictionary);
        }
      } catch (dbError) {
        // Database errors are non-fatal - validator still works in-memory
        logger.warn('[useDictionary] Database seeding warning:', dbError);
      }

      currentLanguageRef.current = lang;
      setIsLoaded(true);
    } catch (err) {
      const loadError = err instanceof Error ? err : new Error('Failed to load dictionary');
      setError(loadError);
      logger.error('[useDictionary] Load error:', loadError);
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Reload dictionary for a new language
   */
  const reloadDictionary = useCallback(async (newLanguage: Language): Promise<void> => {
    // Skip if same language is already loaded
    if (currentLanguageRef.current === newLanguage && isLoaded) {
      return;
    }
    await initializeDictionary(newLanguage);
  }, [initializeDictionary, isLoaded]);

  // Auto-load on mount if enabled
  useEffect(() => {
    if (autoLoad && !isInitializedRef.current) {
      isInitializedRef.current = true;
      initializeDictionary(language);
    }
  }, [autoLoad, language, initializeDictionary]);

  // Handle language changes after initial load
  useEffect(() => {
    if (isInitializedRef.current && currentLanguageRef.current !== language) {
      reloadDictionary(language);
    }
  }, [language, reloadDictionary]);

  return {
    isLoaded,
    isLoading,
    error,
    wordCount,
    reloadDictionary,
  };
}

// Standalone function for use outside React components (e.g., in services)
export async function loadDictionaryForLanguage(language: Language): Promise<void> {
  const dictionary = getDictionary(language);
  const validator = getWordValidator();
  validator.loadDictionary(dictionary);

  try {
    const seeded = await isDictionarySeeded();
    const dbWordCount = getWordCount();
    const expectedCount = dictionary.length;

    if (!seeded || dbWordCount !== expectedCount) {
      await clearDictionary();
      await loadDictionary(dictionary);
    }
  } catch (error) {
    logger.warn('[loadDictionaryForLanguage] Database seeding warning:', error);
  }
}
