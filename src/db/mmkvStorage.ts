/**
 * MMKV Storage Layer
 * High-performance key-value storage for native platforms
 */

import { isWeb } from './platform';
import { logger } from '../utils/logger';

// MMKV Storage Keys
export const MMKV_KEYS = {
  DICTIONARY_EN: 'dict_en',
  DICTIONARY_PL: 'dict_pl',
  HIGHSCORES: 'highscores',
  SEEDED_LANGUAGE: 'seeded_language',
  DICTIONARY_LOADED: 'dictionary_loaded',
} as const;

// Types
export interface StoredHighscore {
  id: number;
  score: number;
  moves: number;
  createdAt: string;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let mmkvInstance: any = null;

/**
 * Initialize MMKV storage (native only)
 */
export function initMMKV(): void {
  if (isWeb) {
    logger.log('[MMKV] Skipping on web platform');
    return;
  }

  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { MMKV } = require('react-native-mmkv');
    mmkvInstance = new MMKV();
    logger.log('[MMKV] Initialized successfully');
  } catch (error) {
    logger.error('[MMKV] Initialization failed:', error);
  }
}

/**
 * Get MMKV instance
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function getMMKV(): any {
  return mmkvInstance;
}

// ============================================
// Dictionary Operations
// ============================================

/**
 * Get dictionary key for language
 */
function getDictionaryKey(language: string): string {
  return language === 'pl' ? MMKV_KEYS.DICTIONARY_PL : MMKV_KEYS.DICTIONARY_EN;
}

/**
 * Save dictionary words to MMKV
 */
export function saveDictionary(language: string, words: string[]): void {
  if (isWeb || !mmkvInstance) return;

  try {
    const key = getDictionaryKey(language);
    mmkvInstance.set(key, JSON.stringify(words));
    mmkvInstance.set(MMKV_KEYS.DICTIONARY_LOADED, 'true');
    logger.log(`[MMKV] Saved ${words.length} words for language: ${language}`);
  } catch (error) {
    logger.error('[MMKV] Failed to save dictionary:', error);
  }
}

/**
 * Load dictionary words from MMKV
 */
export function loadDictionaryFromStorage(language: string): string[] {
  if (isWeb || !mmkvInstance) return [];

  try {
    const key = getDictionaryKey(language);
    const data = mmkvInstance.getString(key);
    if (data) {
      const words = JSON.parse(data) as string[];
      logger.log(`[MMKV] Loaded ${words.length} words for language: ${language}`);
      return words;
    }
  } catch (error) {
    logger.error('[MMKV] Failed to load dictionary:', error);
  }
  return [];
}

/**
 * Check if dictionary is loaded
 */
export function isDictionaryLoaded(): boolean {
  if (isWeb || !mmkvInstance) return false;

  try {
    return mmkvInstance.getString(MMKV_KEYS.DICTIONARY_LOADED) === 'true';
  } catch {
    return false;
  }
}

/**
 * Clear dictionary
 */
export function clearDictionaryStorage(language?: string): void {
  if (isWeb || !mmkvInstance) return;

  try {
    if (language) {
      const key = getDictionaryKey(language);
      mmkvInstance.delete(key);
    } else {
      // Clear all dictionaries
      mmkvInstance.delete(MMKV_KEYS.DICTIONARY_EN);
      mmkvInstance.delete(MMKV_KEYS.DICTIONARY_PL);
    }
    mmkvInstance.delete(MMKV_KEYS.DICTIONARY_LOADED);
    mmkvInstance.delete(MMKV_KEYS.SEEDED_LANGUAGE);
    logger.log('[MMKV] Dictionary cleared');
  } catch (error) {
    logger.error('[MMKV] Failed to clear dictionary:', error);
  }
}

// ============================================
// Seeded Language Operations
// ============================================

/**
 * Get seeded language
 */
export function getSeededLanguageFromStorage(): string | null {
  if (isWeb || !mmkvInstance) return null;

  try {
    return mmkvInstance.getString(MMKV_KEYS.SEEDED_LANGUAGE) ?? null;
  } catch {
    return null;
  }
}

/**
 * Set seeded language
 */
export function setSeededLanguageInStorage(language: string): void {
  if (isWeb || !mmkvInstance) return;

  try {
    mmkvInstance.set(MMKV_KEYS.SEEDED_LANGUAGE, language);
  } catch (error) {
    logger.error('[MMKV] Failed to set seeded language:', error);
  }
}

// ============================================
// Highscore Operations
// ============================================

/**
 * Get all highscores
 */
export function getHighscoresFromStorage(): StoredHighscore[] {
  if (isWeb || !mmkvInstance) return [];

  try {
    const data = mmkvInstance.getString(MMKV_KEYS.HIGHSCORES);
    if (data) {
      return JSON.parse(data) as StoredHighscore[];
    }
  } catch (error) {
    logger.error('[MMKV] Failed to get highscores:', error);
  }
  return [];
}

/**
 * Save all highscores
 */
export function saveHighscoresToStorage(highscores: StoredHighscore[]): void {
  if (isWeb || !mmkvInstance) return;

  try {
    mmkvInstance.set(MMKV_KEYS.HIGHSCORES, JSON.stringify(highscores));
  } catch (error) {
    logger.error('[MMKV] Failed to save highscores:', error);
  }
}

/**
 * Add a new highscore
 */
export function addHighscoreToStorage(score: number, moves: number): number {
  if (isWeb || !mmkvInstance) return 0;

  try {
    const highscores = getHighscoresFromStorage();
    const newId = highscores.length > 0 ? Math.max(...highscores.map(h => h.id)) + 1 : 1;

    const newEntry: StoredHighscore = {
      id: newId,
      score,
      moves,
      createdAt: new Date().toISOString(),
    };

    highscores.push(newEntry);
    saveHighscoresToStorage(highscores);
    logger.log(`[MMKV] Saved highscore: ${score}`);
    return newId;
  } catch (error) {
    logger.error('[MMKV] Failed to add highscore:', error);
    return 0;
  }
}

/**
 * Clear all highscores
 */
export function clearHighscoresStorage(): void {
  if (isWeb || !mmkvInstance) return;

  try {
    mmkvInstance.delete(MMKV_KEYS.HIGHSCORES);
    logger.log('[MMKV] Highscores cleared');
  } catch (error) {
    logger.error('[MMKV] Failed to clear highscores:', error);
  }
}
