/**
 * useGameInit Hook
 * Handles one-time game initialization including:
 * - Database initialization
 * - Language loading
 * - GridManager setup
 * - Dictionary loading
 * - High score restoration
 */

import { useState, useCallback, useRef, useEffect } from 'react';
import { useShallow } from 'zustand/react/shallow';
import { useGameStore } from '../stores/gameStore';
import { useLanguageStore } from '../stores/languageStore';
import { getGridManager, resetGridManager } from '../engine/GridManager';
import { getWordValidator } from '../engine/WordValidator';
import { initDatabase, getHighestScore } from '../db';
import { loadDictionaryForLanguage } from './useDictionary';
import type { Language } from '../types/game.types';
import { logger } from '../utils/logger';

interface UseGameInitOptions {
  /** Whether to auto-initialize on mount */
  autoInit?: boolean;
}

interface UseGameInitReturn {
  /** Whether the game is fully initialized and ready */
  isInitialized: boolean;
  /** Whether initialization is in progress */
  isInitializing: boolean;
  /** Error that occurred during initialization */
  error: Error | null;
  /** Current language */
  language: Language;
  /** Reinitialize the game (e.g., after language change) */
  reinitialize: () => Promise<void>;
  /** Change language and reinitialize */
  changeLanguage: (newLanguage: Language) => Promise<void>;
}

export function useGameInit(options: UseGameInitOptions = {}): UseGameInitReturn {
  const { autoInit = true } = options;

  const [isInitializing, setIsInitializing] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const isInitializedRef = useRef(false);
  const currentLanguageRef = useRef<Language | null>(null);

  // Game store state and actions
  const { isInitialized } = useGameStore(
    useShallow((state) => ({
      isInitialized: state.isInitialized,
    }))
  );

  const gameActions = useGameStore(
    useShallow((state) => ({
      initGame: state.initGame,
      setHighScore: state.setHighScore,
      resetGame: state.resetGame,
      setDictionaryReady: state.setDictionaryReady,
    }))
  );

  // Language store state and actions
  const { language, isLoaded: languageIsLoaded, setLanguage, loadLanguage } = useLanguageStore(
    useShallow((state) => ({
      language: state.language,
      isLoaded: state.isLoaded,
      setLanguage: state.setLanguage,
      loadLanguage: state.loadLanguage,
    }))
  );

  /**
   * Core initialization logic
   */
  const initialize = useCallback(async (): Promise<void> => {
    setIsInitializing(true);
    setError(null);

    // Mark dictionary as NOT ready before loading
    gameActions.setDictionaryReady(false);

    try {
      // Initialize database
      await initDatabase();

      // Load saved language preference
      await loadLanguage();

      // Get current language from store after loading
      const currentLang = useLanguageStore.getState().language;
      currentLanguageRef.current = currentLang;

      // Initialize GridManager with current language
      getGridManager(currentLang);

      // Load dictionary
      await loadDictionaryForLanguage(currentLang);

      // Verify dictionary is actually loaded by checking word count
      const validator = getWordValidator();
      const wordCount = validator.getWordCount();
      if (wordCount === 0) {
        throw new Error('Dictionary failed to load - word count is 0');
      }
      console.log(`[useGameInit] Dictionary loaded with ${wordCount} words`);

      // Restore high score
      const storedHighScore = getHighestScore();
      gameActions.setHighScore(storedHighScore);

      // Initialize game state
      gameActions.initGame();

      // Mark dictionary as ready AFTER successful initialization
      gameActions.setDictionaryReady(true);

      isInitializedRef.current = true;
    } catch (err) {
      const initError = err instanceof Error ? err : new Error('Failed to initialize game');
      setError(initError);
      logger.error('[useGameInit] Initialization error:', initError);
      // Keep dictionary marked as not ready on error
      gameActions.setDictionaryReady(false);
    } finally {
      setIsInitializing(false);
    }
  }, [loadLanguage, gameActions]);

  /**
   * Reinitialize the game (useful after errors or for fresh start)
   */
  const reinitialize = useCallback(async (): Promise<void> => {
    isInitializedRef.current = false;
    await initialize();
  }, [initialize]);

  /**
   * Change language and reinitialize game components
   */
  const changeLanguage = useCallback(async (newLanguage: Language): Promise<void> => {
    if (newLanguage === currentLanguageRef.current) {
      return;
    }

    setIsInitializing(true);
    setError(null);

    // Mark dictionary as NOT ready during language change
    gameActions.setDictionaryReady(false);

    try {
      // Save new language preference
      await setLanguage(newLanguage);
      currentLanguageRef.current = newLanguage;

      // Reset and reinitialize GridManager with new language
      resetGridManager();
      getGridManager(newLanguage);

      // Load dictionary for new language
      await loadDictionaryForLanguage(newLanguage);

      // Verify dictionary loaded
      const validator = getWordValidator();
      const wordCount = validator.getWordCount();
      if (wordCount === 0) {
        throw new Error('Dictionary failed to load for new language');
      }
      console.log(`[useGameInit] Dictionary loaded with ${wordCount} words for ${newLanguage}`);

      // Reset and reinitialize game
      gameActions.resetGame();
      gameActions.initGame();

      // Mark dictionary as ready AFTER successful change
      gameActions.setDictionaryReady(true);
    } catch (err) {
      const langError = err instanceof Error ? err : new Error('Failed to change language');
      setError(langError);
      logger.error('[useGameInit] Language change error:', langError);
      // Keep dictionary marked as not ready on error
      gameActions.setDictionaryReady(false);
    } finally {
      setIsInitializing(false);
    }
  }, [setLanguage, gameActions]);

  // Auto-initialize on mount
  useEffect(() => {
    if (autoInit && !isInitializedRef.current) {
      initialize();
    }
  }, [autoInit, initialize]);

  // Handle external language changes (e.g., from settings)
  useEffect(() => {
    if (
      isInitializedRef.current &&
      languageIsLoaded &&
      currentLanguageRef.current !== null &&
      language !== currentLanguageRef.current
    ) {
      // Language was changed externally, reinitialize
      changeLanguage(language);
    }
  }, [language, languageIsLoaded, changeLanguage]);

  return {
    isInitialized,
    isInitializing,
    error,
    language,
    reinitialize,
    changeLanguage,
  };
}
