/**
 * useDictionary Hook
 * Encapsulates dictionary initialization and management
 * Handles loading, validation, and database seeding
 */

import { useState, useCallback, useRef, useEffect } from 'react';
import { getWordValidator } from '../engine/WordValidator';
import { getDictionary } from '../data/dictionaries';
import { seedDictionaryIfNeeded } from '../services/dictionarySeeder';
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

      // Seed database using the proper seeder service
      try {
        const result = await seedDictionaryIfNeeded(lang);
        logger.log(`[useDictionary] Seeded: ${result.wordCount} words, wasReseeded: ${result.wasReseeded}`);
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
  // Load dictionary into WordValidator (in-memory for game logic)
  const dictionary = getDictionary(language);
  const validator = getWordValidator();
  validator.loadDictionary(dictionary);

  // Seed database using the proper seeder service
  try {
    const result = await seedDictionaryIfNeeded(language);
    logger.log(`[loadDictionaryForLanguage] Seeded: ${result.wordCount} words, wasReseeded: ${result.wasReseeded}`);
  } catch (error) {
    logger.warn('[loadDictionaryForLanguage] Database seeding warning:', error);
  }
}
