/**
 * Platform-Adaptive Dictionary Database Operations
 * Uses in-memory Set on web, expo-sqlite on native
 */

import { isWeb } from './platform';
import { getDatabase } from './database';
import type { DictionaryWord } from '../types/game.types';
import { logger } from '../utils/logger';

// In-memory dictionary for web platform
let webDictionary: Set<string> = new Set();

/**
 * Check if a word exists in the dictionary
 */
export function isValidWord(word: string): boolean {
  const upperWord = word.toUpperCase();

  if (isWeb) {
    return webDictionary.has(upperWord);
  }

  const database = getDatabase();
  if (!database) return false;

  const result = database.getFirstSync(
    'SELECT id, word FROM dictionary WHERE word = ? COLLATE NOCASE',
    [upperWord]
  ) as DictionaryWord | null;
  return result !== null;
}

/**
 * Load words into dictionary (platform-adaptive)
 */
export async function loadDictionary(words: string[]): Promise<number> {
  let insertedCount = 0;

  if (isWeb) {
    // Web: Load into in-memory Set
    for (const word of words) {
      const upperWord = word.toUpperCase().trim();
      if (upperWord.length >= 3 && upperWord.length <= 15) {
        webDictionary.add(upperWord);
        insertedCount++;
      }
    }
    localStorage.setItem('lettercrush_dictionary_loaded', 'true');
    logger.log(`[Dictionary] Web: Loaded ${insertedCount} words into memory`);
    return insertedCount;
  }

  // Native: Use SQLite
  const database = getDatabase();
  if (!database) return 0;

  await database.withTransactionAsync(async () => {
    const statement = await database.prepareAsync(
      'INSERT OR IGNORE INTO dictionary (word) VALUES (?)'
    );

    try {
      for (const word of words) {
        const upperWord = word.toUpperCase().trim();
        if (upperWord.length >= 3 && upperWord.length <= 15) {
          await statement.executeAsync([upperWord]);
          insertedCount++;
        }
      }
    } finally {
      await statement.finalizeAsync();
    }
  });

  logger.log(`[Dictionary] SQLite: Loaded ${insertedCount} words`);
  return insertedCount;
}

/**
 * Get all words from dictionary
 */
export function getAllWords(): string[] {
  if (isWeb) {
    return Array.from(webDictionary).sort();
  }

  const database = getDatabase();
  if (!database) return [];

  const results = database.getAllSync(
    'SELECT word FROM dictionary ORDER BY word'
  ) as DictionaryWord[];
  return results.map((r: DictionaryWord) => r.word);
}

/**
 * Get words with a specific prefix
 */
export function getWordsWithPrefix(prefix: string, limit: number = 10): string[] {
  const upperPrefix = prefix.toUpperCase();

  if (isWeb) {
    const matches: string[] = [];
    for (const word of webDictionary) {
      if (word.startsWith(upperPrefix)) {
        matches.push(word);
        if (matches.length >= limit) break;
      }
    }
    return matches.sort((a, b) => a.length - b.length);
  }

  const database = getDatabase();
  if (!database) return [];

  const results = database.getAllSync(
    'SELECT word FROM dictionary WHERE word LIKE ? ORDER BY LENGTH(word) LIMIT ?',
    [`${upperPrefix}%`, limit]
  ) as DictionaryWord[];
  return results.map((r: DictionaryWord) => r.word);
}

/**
 * Get word count
 */
export function getWordCount(): number {
  if (isWeb) {
    return webDictionary.size;
  }

  const database = getDatabase();
  if (!database) return 0;

  const result = database.getFirstSync(
    'SELECT COUNT(*) as count FROM dictionary'
  ) as { count: number } | null;
  return result?.count ?? 0;
}

/**
 * Clear all words from dictionary
 */
export async function clearDictionary(): Promise<void> {
  if (isWeb) {
    webDictionary.clear();
    localStorage.setItem('lettercrush_dictionary_loaded', 'false');
    localStorage.removeItem('lettercrush_seeded_language');
    logger.log('[Dictionary] Web: Cleared all words');
    return;
  }

  const database = getDatabase();
  if (!database) return;

  await database.execAsync('DELETE FROM dictionary');
  logger.log('[Dictionary] SQLite: Cleared all words');
}

// Storage keys for seeding status
const SEEDED_LANGUAGE_KEY = 'lettercrush_seeded_language';

/**
 * Check if dictionary has been seeded with words
 */
export function isDictionarySeeded(): boolean {
  if (isWeb) {
    return localStorage.getItem('lettercrush_dictionary_loaded') === 'true';
  }
  return getWordCount() > 0;
}

/**
 * Get the language that was used to seed the dictionary
 */
export function getSeededLanguage(): string | null {
  if (isWeb) {
    return localStorage.getItem(SEEDED_LANGUAGE_KEY);
  }
  // For native, we also store in a simple key-value approach
  // using localStorage polyfill or AsyncStorage
  try {
    const database = getDatabase();
    if (!database) return null;
    const result = database.getFirstSync(
      "SELECT value FROM app_settings WHERE key = ?",
      [SEEDED_LANGUAGE_KEY]
    ) as { value: string } | null;
    return result?.value ?? null;
  } catch {
    return null;
  }
}

/**
 * Set the language that was used to seed the dictionary
 */
export async function setSeededLanguage(language: string): Promise<void> {
  if (isWeb) {
    localStorage.setItem(SEEDED_LANGUAGE_KEY, language);
    return;
  }

  const database = getDatabase();
  if (!database) return;

  try {
    await database.execAsync(`
      CREATE TABLE IF NOT EXISTS app_settings (
        key TEXT PRIMARY KEY,
        value TEXT NOT NULL
      )
    `);
    await database.runAsync(
      "INSERT OR REPLACE INTO app_settings (key, value) VALUES (?, ?)",
      [SEEDED_LANGUAGE_KEY, language]
    );
  } catch (error) {
    logger.warn('[Dictionary] Failed to save seeded language:', error);
  }
}
