/**
 * Platform-Adaptive Dictionary Database Operations
 * Uses in-memory Set on all platforms, MMKV for persistence on native
 */

import { isWeb } from './platform';
import { logger } from '../utils/logger';
import {
  saveDictionary,
  loadDictionaryFromStorage,
  isDictionaryLoaded,
  clearDictionaryStorage,
  getSeededLanguageFromStorage,
  setSeededLanguageInStorage,
} from './mmkvStorage';

// In-memory dictionary for fast lookups
let dictionary: Set<string> = new Set();

/**
 * Check if a word exists in the dictionary
 */
export function isValidWord(word: string): boolean {
  const upperWord = word.toUpperCase();
  return dictionary.has(upperWord);
}

/**
 * Load words into dictionary (platform-adaptive)
 */
export async function loadDictionary(words: string[]): Promise<number> {
  let insertedCount = 0;

  // Load into in-memory Set (both platforms)
  for (const word of words) {
    const upperWord = word.toUpperCase().trim();
    if (upperWord.length >= 3 && upperWord.length <= 15) {
      dictionary.add(upperWord);
      insertedCount++;
    }
  }

  if (isWeb) {
    localStorage.setItem('lettercrush_dictionary_loaded', 'true');
    logger.log(`[Dictionary] Web: Loaded ${insertedCount} words into memory`);
  } else {
    // Native: Also persist to MMKV
    const language = getSeededLanguageFromStorage() ?? 'en';
    saveDictionary(language, Array.from(dictionary));
    logger.log(`[Dictionary] MMKV: Loaded ${insertedCount} words`);
  }

  return insertedCount;
}

/**
 * Get all words from dictionary
 */
export function getAllWords(): string[] {
  return Array.from(dictionary).sort();
}

/**
 * Get words with a specific prefix
 */
export function getWordsWithPrefix(prefix: string, limit: number = 10): string[] {
  const upperPrefix = prefix.toUpperCase();
  const matches: string[] = [];

  for (const word of dictionary) {
    if (word.startsWith(upperPrefix)) {
      matches.push(word);
      if (matches.length >= limit) break;
    }
  }

  return matches.sort((a, b) => a.length - b.length);
}

/**
 * Get word count
 */
export function getWordCount(): number {
  return dictionary.size;
}

/**
 * Clear all words from dictionary
 */
export async function clearDictionary(): Promise<void> {
  dictionary.clear();

  if (isWeb) {
    localStorage.setItem('lettercrush_dictionary_loaded', 'false');
    localStorage.removeItem('lettercrush_seeded_language');
    logger.log('[Dictionary] Web: Cleared all words');
  } else {
    clearDictionaryStorage();
    logger.log('[Dictionary] MMKV: Cleared all words');
  }
}

/**
 * Check if dictionary has been seeded with words
 */
export function isDictionarySeeded(): boolean {
  if (isWeb) {
    return localStorage.getItem('lettercrush_dictionary_loaded') === 'true';
  }
  return isDictionaryLoaded() || dictionary.size > 0;
}

/**
 * Get the language that was used to seed the dictionary
 */
export function getSeededLanguage(): string | null {
  if (isWeb) {
    return localStorage.getItem('lettercrush_seeded_language');
  }
  return getSeededLanguageFromStorage();
}

/**
 * Set the language that was used to seed the dictionary
 */
export async function setSeededLanguage(language: string): Promise<void> {
  if (isWeb) {
    localStorage.setItem('lettercrush_seeded_language', language);
    return;
  }
  setSeededLanguageInStorage(language);
}

/**
 * Restore dictionary from MMKV storage (native only)
 * Call this on app startup to restore persisted dictionary
 */
export function restoreDictionaryFromStorage(language: string): boolean {
  if (isWeb) return false;

  const words = loadDictionaryFromStorage(language);
  if (words.length > 0) {
    dictionary = new Set(words);
    logger.log(`[Dictionary] Restored ${words.length} words from MMKV`);
    return true;
  }
  return false;
}
